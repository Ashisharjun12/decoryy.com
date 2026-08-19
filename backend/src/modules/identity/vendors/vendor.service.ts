import type { IVendorRepository } from "@/modules/identity/vendors/vendor.repository.js";
import type { NewVendor, Vendor } from "@/modules/identity/vendors/vendor.schema.js";
import type { User } from "@/modules/identity/users/user.schema.js";

export interface IVendorService {
    findByUserId(userId: string): Promise<Vendor | undefined>;
    create(data: NewVendor): Promise<Vendor>;
    createWithUser(input: { phone: string; name: string; city: string }): Promise<User>;
}

export class VendorService implements IVendorService {
    constructor(private readonly vendors: IVendorRepository) {}

    findByUserId(userId: string) {
        return this.vendors.findByUserId(userId);
    }

    create(data: NewVendor) {
        return this.vendors.create(data);
    }

    createWithUser(input: { phone: string; name: string; city: string }) {
        return this.vendors.createWithUser(input);
    }
}
