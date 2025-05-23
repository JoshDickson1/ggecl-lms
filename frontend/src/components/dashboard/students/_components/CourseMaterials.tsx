import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
  } from "@/components/ui/tabs";
  import {
    Download,
    FileText,
    Image as ImageIcon,
    Video,
    File,
  } from "lucide-react";
  import dayjs from "dayjs";
  
  type FileType = "image" | "video" | "pdf" | "doc" | "zip" | "other";
  
  type Material = {
    id: string;
    name: string;
    type: FileType;
    url: string;
    uploadedAt: string;
  };
  
  interface CourseMaterialSet {
    title: string;
    materials: Material[];
  }
  
  interface CourseMaterialsProps {
    sections: CourseMaterialSet[];
  }
  
  const getIcon = (type: FileType) => {
    switch (type) {
      case "image":
        return <ImageIcon className="text-blue-500 h-5 w-5" />;
      case "video":
        return <Video className="text-pink-500 h-5 w-5" />;
      case "pdf":
      case "doc":
        return <FileText className="text-red-500 h-5 w-5" />;
      case "zip":
        return <File className="text-yellow-500 h-5 w-5" />;
      default:
        return <File className="text-gray-500 h-5 w-5" />;
    }
  };
  
  const formatDate = (date: string) =>
    dayjs(date).format("MMM D, YYYY h:mm A");
  
  const groupedByType = (materials: Material[]) => {
    const groups: { [key in FileType]?: Material[] } = {};
    materials.forEach((mat) => {
      if (!groups[mat.type]) groups[mat.type] = [];
      groups[mat.type]!.push(mat);
    });
    return groups;
  };
  
  export const CourseMaterials = ({ sections }: CourseMaterialsProps) => {
    return (
      <div className="w-full space-y-8">
        {sections.map(({ title, materials }) => {
          if (!materials || materials.length === 0) {
            return (
              <Card className="w-full" key={title}>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No materials uploaded yet.
                  </p>
                </CardContent>
              </Card>
            );
          }
  
          const materialGroups = groupedByType(materials);
          const tabs = Object.keys(materialGroups) as FileType[];
  
          return (
            <Card className="w-full" key={title}>
              <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  All files uploaded for this section are grouped by file type.
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={tabs[0]} className="w-full md:min-w-[92rem]">
                  <TabsList className="flex flex-wrap gap-2">
                    {tabs.map((type) => (
                      <TabsTrigger key={type} value={type}>
                        {type}s
                      </TabsTrigger>
                    ))}
                  </TabsList>
  
                  {tabs.map((type) => (
                    <TabsContent key={type} value={type} className="mt-4">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {materialGroups[type]?.map((material) => (
                          <div
                            key={material.id}
                            className="rounded-xl border bg-muted p-4 shadow-sm transition hover:shadow-md"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 truncate">
                                {getIcon(material.type)}
                                <span className="truncate text-sm font-medium">
                                  {material.name}
                                </span>
                              </div>
                              <a
                                href={material.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                            </div>
  
                            {(material.type === "image" ||
                              material.type === "video") && (
                              <div className="rounded-md overflow-hidden mb-2">
                                {material.type === "image" ? (
                                  <img
                                    src={material.url}
                                    alt={material.name}
                                    className="h-52 w-full object-contain"
                                  />
                                ) : (
                                  <video
                                    controls
                                    className="h-72 w-full rounded-md object-contain"
                                  >
                                    <source src={material.url} />
                                  </video>
                                )}
                              </div>
                            )}
  
                            <p className="text-xs text-muted-foreground">
                              Uploaded: {formatDate(material.uploadedAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
    export default CourseMaterials;  