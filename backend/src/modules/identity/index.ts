import { AuthController } from "@/modules/identity/auth/auth.controller.js";
import { AuthService } from "@/modules/identity/auth/auth.service.js";
import { createAuthRouter } from "@/modules/identity/auth/auth.route.js";
import { SessionRepository } from "@/modules/identity/sessions/session.repository.js";
import { sessions } from "@/modules/identity/sessions/session.schema.js";
import { SessionService } from "@/modules/identity/sessions/session.service.js";
import { UserController } from "@/modules/identity/users/user.controller.js";
import { UserRepository } from "@/modules/identity/users/user.repository.js";
import { createUserRouter } from "@/modules/identity/users/user.route.js";
import { users } from "@/modules/identity/users/user.schema.js";
import { UserService } from "@/modules/identity/users/user.service.js";
import { CustomerAdminController } from "@/modules/identity/customers/customer.admin.controller.js";
import { CustomerRepository } from "@/modules/identity/customers/customer.repository.js";
import { CustomerService } from "@/modules/identity/customers/customer.service.js";
import { createCustomerAdminRouter } from "@/modules/identity/customers/customer.route.js";
import {
    VendorAdminController,
    VendorController,
} from "@/modules/identity/vendors/vendor.controller.js";
import { VendorRepository } from "@/modules/identity/vendors/vendor.repository.js";
import {
    createVendorAdminRouter,
    createVendorRouter,
} from "@/modules/identity/vendors/vendor.route.js";
import { vendors } from "@/modules/identity/vendors/vendor.schema.js";
import { VendorService } from "@/modules/identity/vendors/vendor.service.js";
import { VendorTeamController } from "@/modules/identity/vendor-members/vendor-team.controller.js";
import { VendorTeamService } from "@/modules/identity/vendor-members/vendor-team.service.js";
import { VendorMemberRepository } from "@/modules/identity/vendor-members/vendor-member.repository.js";
import {
    AssignmentRepository,
    VendorJobController,
    VendorJobRepository,
    VendorJobService,
} from "@/modules/assignment/index.js";
import { OrderRepository } from "@/modules/booking/orders/order.repository.js";
import { OrderService } from "@/modules/booking/orders/order.service.js";
import {
    notificationService,
    userNotificationController,
    vendorNotificationController,
} from "@/modules/notifications/index.js";
import {
    CollectionController,
    PaymentIntentRepository,
    PaymentIntentService,
    WalletController,
    PayoutMethodController,
    collectionService,
    walletService,
} from "@/modules/payments/index.js";
import { mediaService } from "@/modules/upload/index.js";
import { bookingChatService } from "@/modules/chat/index.js";
import { RealtimeFactory } from "@/infrastructure/realtime/realtime.factory.js";

const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();
const sessionRepository = new SessionRepository();

const userService = new UserService(userRepository);
const vendorService = new VendorService(vendorRepository, mediaService, userService);
const sessionService = new SessionService(sessionRepository, userRepository);
const authService = new AuthService(userService, vendorService, sessionService, notificationService);
const authController = new AuthController(authService);
const userController = new UserController(authService);
const vendorController = new VendorController(authService, vendorService);
const vendorAdminController = new VendorAdminController(vendorService);
const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);
const customerAdminController = new CustomerAdminController(customerService);

const orderRepository = new OrderRepository();
const assignmentRepository = new AssignmentRepository();
const paymentIntentService = new PaymentIntentService(
    new PaymentIntentRepository(),
    orderRepository,
    notificationService,
    () => {
        throw new Error("order service not initialized");
    },
    async () => {},
);
const orderServiceForVendorJobs = new OrderService(
    orderRepository,
    notificationService,
    paymentIntentService,
    assignmentRepository,
);
const vendorJobService = new VendorJobService(
    new VendorJobRepository(),
    vendorRepository,
    assignmentRepository,
    orderRepository,
    notificationService,
    (orderId) => orderServiceForVendorJobs.getForAdmin(orderId),
    bookingChatService,
    RealtimeFactory.getProvider(),
);
const vendorJobController = new VendorJobController(vendorJobService);
const vendorTeamService = new VendorTeamService(
    new VendorMemberRepository(),
    vendorRepository,
    userService,
);
const vendorTeamController = new VendorTeamController(vendorTeamService);
const collectionController = new CollectionController(collectionService);
const walletController = new WalletController(walletService);
const payoutMethodController = new PayoutMethodController();

export const authRouter = createAuthRouter(authController);
export const userRouter = createUserRouter(
    authController,
    userController,
    userNotificationController,
);
export const vendorRouter = createVendorRouter(
    vendorController,
    vendorNotificationController,
    vendorJobController,
    collectionController,
    walletController,
    payoutMethodController,
    vendorTeamController,
);
export const vendorAdminRouter = createVendorAdminRouter(vendorAdminController);
export const customerAdminRouter = createCustomerAdminRouter(customerAdminController);
export { users, vendors, sessions };
