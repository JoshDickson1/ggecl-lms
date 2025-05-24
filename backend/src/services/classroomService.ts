// services/classroomService.ts
import { Types } from "mongoose";
import { ClassroomModel } from "../models/classroomModel.js";
import { NotificationService } from "./notificationService.js";
import coursesModel from "../models/coursesModel.js";

class ClassroomService {
  // Create a new classroom
  static async createClassroom(
    name: string,
    courseId: Types.ObjectId,
    instructorId: Types.ObjectId
  ) {
    const classroom = new ClassroomModel({
      name,
      course: courseId,
      instructors: [instructorId],
    });
    await classroom.save();
    const course = await coursesModel.findById(courseId).select("title");

    // Send notification to admins with course name and ID
    await NotificationService.notifyAdmins({
      title: "New Classroom Created",
      content: `A new classroom "${name}" has been created for course "${course?.title}" (${courseId}).`,
    });

    return classroom;
  }

  // Add activity to classroom
  static async addActivity(
    classroomId: Types.ObjectId,
    activity: {
      title: string;
      description?: string;
      files: {
        url: string;
        name: string;
        type: "video" | "pdf" | "document" | "audio" | "image";
      }[];
    },
    createdBy: Types.ObjectId
  ) {
    const classroom = await ClassroomModel.findByIdAndUpdate(
      classroomId,
      {
        $push: {
          activities: {
            ...activity,
            createdBy,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (classroom) {
      // Notify students about new activity
      await NotificationService.notifyCourseStudents(
        classroom.course,
        {
          title: "New Classroom Activity",
          content: `A new activity "${activity.title}" has been posted in ${classroom.name}`,
        },
        classroomId
      );

      // Notify admins
      await NotificationService.notifyAdmins({
        title: "New Activity Created",
        content: `Instructor created new activity "${activity.title}" in classroom ${classroom.name}`,
      });
    }

    return classroom;
  }

  // Create a new group in classroom
  static async createGroup(
    classroomId: Types.ObjectId,
    name: string,
    studentIds: Types.ObjectId[],
    createdBy: Types.ObjectId
  ) {
    // First, find the classroom to check enrolled students
    const classroom = await ClassroomModel.findById(classroomId);

    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Check for duplicate group name
    const groupNameExists = classroom.groups.some(
      (group) => group.name.toLowerCase() === name.toLowerCase()
    );

    if (groupNameExists) {
      throw new Error(
        `A group with name "${name}" already exists in this classroom`
      );
    }

    // Check if all studentIds are actually enrolled in the classroom
    const invalidStudents = studentIds.filter(
      (studentId) => !classroom.students.includes(studentId)
    );

    if (invalidStudents.length > 0) {
      throw new Error(
        `Cannot add students to group who aren't enrolled in the classroom: ${invalidStudents.join(
          ", "
        )}`
      );
    }

    // Now update the classroom with the new group
    const updatedClassroom = await ClassroomModel.findByIdAndUpdate(
      classroomId,
      {
        $push: {
          groups: {
            name,
            students: studentIds,
            assignments: [],
            createdBy,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (updatedClassroom) {
      // Notify students added to group
      await NotificationService.notifyStudents(studentIds, {
        title: "You've been added to a group",
        content: `You've been added to group "${name}" in ${updatedClassroom.name}`,
      });

      // Notify admins
      await NotificationService.notifyAdmins({
        title: "New Group Created",
        content: `New group "${name}" created in classroom ${classroom.name} with ${studentIds.length} students`,
      });
    }

    return classroom;
  }

  // Add students to a group
  static async addStudentsToGroup(
    classroomId: Types.ObjectId,
    groupName: string,
    studentIds: Types.ObjectId[],
    requesterId: Types.ObjectId
  ) {
    const classroom = await ClassroomModel.findById(classroomId);
    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Check if requester is admin or instructor
    const isInstructor = classroom.instructors.some((instructor) =>
      instructor.equals(requesterId)
    );
    if (!isInstructor) {
      throw new Error("Only instructors or admins can modify groups");
    }

    const updatedClassroom = await ClassroomModel.findOneAndUpdate(
      {
        _id: classroomId,
        "groups.name": groupName,
      },
      {
        $addToSet: {
          "groups.$.students": { $each: studentIds },
        },
      },
      { new: true }
    );

    // Notify added students
    await NotificationService.notifyStudents(studentIds, {
      title: "Added to Group",
      content: `You've been added to group "${groupName}" in ${classroom.name}`,
    });

    // Notify admins
    await NotificationService.notifyAdmins({
      title: "Students Added to Group",
      content: `${studentIds.length} students added to group "${groupName}" in classroom ${classroom.name}`,
    });

    return updatedClassroom;
  }

  // Remove students from a group
  static async removeStudentsFromGroup(
    classroomId: Types.ObjectId,
    groupName: string,
    studentIds: Types.ObjectId[],
    requesterId: Types.ObjectId
  ) {
    const classroom = await ClassroomModel.findById(classroomId);
    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Check if requester is admin or instructor
    const isInstructor = classroom.instructors.some((instructor) =>
      instructor.equals(requesterId)
    );
    if (!isInstructor) {
      throw new Error("Only instructors or admins can modify groups");
    }

    const updatedClassroom = await ClassroomModel.findOneAndUpdate(
      {
        _id: classroomId,
        "groups.name": groupName,
      },
      {
        $pull: {
          "groups.$.students": { $in: studentIds },
        },
      },
      { new: true }
    );

    // Notify removed students
    await NotificationService.notifyStudents(studentIds, {
      title: "Removed from Group",
      content: `You've been removed from group "${groupName}" in ${classroom.name}`,
    });

    // Notify admins
    await NotificationService.notifyAdmins({
      title: "Students Removed from Group",
      content: `${studentIds.length} students removed from group "${groupName}" in classroom ${classroom.name}`,
    });

    return updatedClassroom;
  }
  // Get all groups in a classroom
  static async getClassroomGroups(classroomId: Types.ObjectId) {
    const classroom = await ClassroomModel.findById(classroomId)
      .select("groups")
      .populate("groups.students")
      .populate("groups.assignments.assignmentId")
      .populate("groups.assignments.grades.student")
      .populate("groups.assignments.grades.gradedBy");

    return classroom?.groups || [];
  }

  // Delete a group from classroom

  static async deleteGroup(
    classroomId: Types.ObjectId,
    groupName: string,
    requesterId: Types.ObjectId
  ) {
    const classroom = await ClassroomModel.findById(classroomId);
    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Check if requester is admin or instructor
    const isInstructor = classroom.instructors.some((instructor) =>
      instructor.equals(requesterId)
    );
    if (!isInstructor) {
      throw new Error("Only instructors or admins can delete groups");
    }

    // Get group info before deletion for notification
    const groupToDelete = classroom.groups.find((g) => g.name === groupName);
    const studentCount = groupToDelete?.students.length || 0;

    const updatedClassroom = await ClassroomModel.findByIdAndUpdate(
      classroomId,
      {
        $pull: {
          groups: { name: groupName },
        },
      },
      { new: true }
    );

    // Notify admins
    await NotificationService.notifyAdmins({
      title: "Group Deleted",
      content: `Group "${groupName}" with ${studentCount} students was deleted from classroom ${classroom.name}`,
    });

    return updatedClassroom;
  }

  // Add assignment to group
  static async addAssignmentToGroup(
    classroomId: Types.ObjectId,
    groupName: string,
    assignmentId: Types.ObjectId
  ) {
    const classroom = await ClassroomModel.findOneAndUpdate(
      {
        _id: classroomId,
        "groups.name": groupName,
      },
      {
        $push: {
          "groups.$.assignments": {
            assignmentId,
            assignedAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate("groups.students");

    if (classroom) {
      const group = classroom.groups.find((g) => g.name === groupName);
      if (group) {
        // Notify students in the group
        await NotificationService.notifyStudents(group.students, {
          title: "New Assignment Added",
          content: `A new assignment has been added to group "${groupName}" in ${classroom.name}`,
        });

        // Notify admins
        await NotificationService.notifyAdmins({
          title: "Assignment Added to Group",
          content: `New assignment added to group "${groupName}" in classroom ${classroom.name}`,
        });
      }
    }

    return classroom;
  }

  // Grade an assignment in a group
  static async gradeGroupAssignment(
    classroomId: Types.ObjectId,
    groupName: string,
    assignmentId: Types.ObjectId,
    grades: {
      studentId: Types.ObjectId;
      score: number;
      feedback?: string;
    }[],
    gradedBy: Types.ObjectId
  ) {
    const classroom = await ClassroomModel.findOne({
      _id: classroomId,
      "groups.name": groupName,
      "groups.assignments.assignmentId": assignmentId,
    });

    if (!classroom) {
      throw new Error("Classroom, group, or assignment not found");
    }

    // Update grades for each student
    const updateOperations = grades.map((grade) => ({
      updateOne: {
        filter: {
          _id: classroomId,
          "groups.name": groupName,
          "groups.assignments.assignmentId": assignmentId,
          "groups.assignments.grades.student": { $ne: grade.studentId },
        },
        update: {
          $push: {
            "groups.$[group].assignments.$[assignment].grades": {
              student: grade.studentId,
              score: grade.score,
              feedback: grade.feedback,
              gradedBy,
              gradedAt: new Date(),
            },
          },
        },
        arrayFilters: [
          { "group.name": groupName },
          { "assignment.assignmentId": assignmentId },
        ],
      },
    }));

    await ClassroomModel.bulkWrite(updateOperations);

    // Notify students about their grades
    await Promise.all(
      grades.map(async (grade) => {
        await NotificationService.createNotification(
          grade.studentId,
          "student",
          {
            title: "Assignment Graded",
            content: `Your assignment has been graded. Score: ${grade.score}`,
          }
        );

        // Notify admins
        await NotificationService.notifyAdmins({
          title: "Assignment Graded",
          content: `${grades.length} students received grades for assignment in group ${groupName}`,
        });
      })
    );

    return ClassroomModel.findById(classroomId)
      .populate("groups.assignments.grades.student")
      .populate("groups.assignments.grades.gradedBy");
  }

  // Record student attendance duration
  static async recordAttendance(
    classroomId: Types.ObjectId,
    studentId: Types.ObjectId,
    duration: number
  ) {
    return ClassroomModel.findOneAndUpdate(
      {
        _id: classroomId,
        "attendance.student": studentId,
        "attendance.date": {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      {
        $inc: { "attendance.$.duration": duration },
      },
      { new: true }
    );
  }

  // Get classroom by ID
  static async getClassroomById(classroomId: Types.ObjectId) {
    return ClassroomModel.findById(classroomId)
      .populate("course")
      .populate("instructors")
      .populate("students")
      .populate("groups.students")
      .populate("groups.assignments")
      .populate("attendance.student");
  }

  // Get all classrooms for a course
  static async getClassroomsByCourse(courseId: Types.ObjectId) {
    return ClassroomModel.find({ course: courseId })
      .populate("instructors")
      .populate("students");
  }

  // Add student to classroom
  static async addStudentToClassroom(
    classroomId: Types.ObjectId,
    studentId: Types.ObjectId
  ) {
    const classroom = await ClassroomModel.findByIdAndUpdate(
      classroomId,
      {
        $addToSet: { students: studentId },
      },
      { new: true }
    ).populate<{ course: { title: string } }>("course");

    if (classroom) {
      // Notify the student
      await NotificationService.createNotification(studentId, "student", {
        title: "Added to Classroom",
        content: `You've been added to classroom "${classroom.name}" for course "${classroom.course.title}"`,
      });

      // Notify admins
      await NotificationService.notifyAdmins({
        title: "Student Added to Classroom",
        content: `Student ${studentId} was added to classroom "${classroom.name}"`,
      });
    }

    return classroom;
  }

  // Remove student from classroom
  static async removeStudentFromClassroom(
    classroomId: Types.ObjectId,
    studentId: Types.ObjectId
  ) {
    const classroom = await ClassroomModel.findByIdAndUpdate(
      classroomId,
      {
        $pull: { students: studentId },
      },
      { new: true }
    ).populate<{ course: { title: string } }>("course");

    if (classroom) {
      // Notify the student
      await NotificationService.createNotification(studentId, "student", {
        title: "Removed from Classroom",
        content: `You've been removed from classroom "${classroom.name}" for course "${classroom.course.title}"`,
      });

      // Notify admins
      await NotificationService.notifyAdmins({
        title: "Student Removed from Classroom",
        content: `Student ${studentId} was removed from classroom "${classroom.name}"`,
      });
    }

    return classroom;
  }
}

export { ClassroomService };
