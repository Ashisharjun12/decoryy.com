import { AuthController } from "@/modules/identity/auth/auth.controller.js";
import { AuthService } from "@/modules/identity/auth/auth.service.js";
import { createAuthRouter } from "@/modules/identity/auth/auth.route.js";
import { SessionRepository } from "@/modules/identity/sessions/session.repository.js";
import { sessions } from "@/modules/identity/sessions/session.schema.js";
import { SessionService } from "@/modules/identity/sessions/session.service.js";
import { UserRepository } from "@/modules/identity/users/user.repository.js";
import { createUserRouter } from "@/modules/identity/users/user.route.js";
import { users } from "@/modules/identity/users/user.schema.js";
import { UserService } from "@/modules/identity/users/user.service.js";
import { VendorController } from "@/modules/identity/vendors/vendor.controller.js";
import { VendorRepository } from "@/modules/identity/vendors/vendor.repository.js";
import { createVendorRouter } from "@/modules/identity/vendors/vendor.route.js";
import { vendors } from "@/modules/identity/vendors/vendor.schema.js";
import { VendorService } from "@/modules/identity/vendors/vendor.service.js";
import { SmsService } from "@/modules/notifications/sms/sms.service.js";

const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();
const sessionRepository = new SessionRepository();

const userService = new UserService(userRepository);
const vendorService = new VendorService(vendorRepository);
const sessionService = new SessionService(sessionRepository, userRepository);
const smsService = new SmsService();
const authService = new AuthService(userService, vendorService, sessionService, smsService);
const authController = new AuthController(authService);
const vendorController = new VendorController(authService);

export const authRouter = createAuthRouter(authController);
export const userRouter = createUserRouter(authController);
export const vendorRouter = createVendorRouter(vendorController);
export { users, vendors, sessions };
