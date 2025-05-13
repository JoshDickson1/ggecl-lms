import { adminService } from "../../services/adminService.js";
import { envConfig } from "../../config/envValidator.js";

export async function initSuperAdmin() {
  try {
    const superAdminData = {
      email: envConfig.superadminEmail,
      password: envConfig.superadminPassword,
      fullName: "System Superadmin",
      role: "admin",
      permissions: ["all"],
      isVerified: true,
    };

    const existingSuperadmin = await adminService.findAdminByEmail(
      superAdminData.email
    );

    if (existingSuperadmin) {
      console.log("Superadmin already exists");
      return;
    }

    // Create new superadmin
    const superadmin = await adminService.createAdmin(superAdminData);

    const { refreshToken } = adminService.generateAuthTokens(
      superadmin._id.toString()
    );

    await adminService.updateRefreshToken(
      superadmin._id.toString(),
      refreshToken
    );

    console.log("\nSuperadmin created successfully:");
    console.log("----------------------------------");
    console.log(`Email: ${superadmin.email}`);
    // console.log(`ID: ${superadmin._id}`);
    // console.log(`Access Token: ${accessToken}`);
    console.log("----------------------------------");
    console.log("IMPORTANT: Store these credentials securely!");
    console.log("----------------------------------\n");
  } catch (error) {
    console.error("\nFailed to create superadmin:");
    console.error("----------------------------------");
    console.error(error);
    console.error("----------------------------------");
    process.exit(1);
  }
}
