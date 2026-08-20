import { and, eq } from "drizzle-orm";
import { db } from "@/db/postgres-client.js";
import {
    addonCityPrices,
    cityPrices,
    type AddonCityPrice,
    type CityPrice,
} from "@/modules/catalog/pricing/city-price.schema.js";

export interface ICityPriceRepository {
    getProductPrice(productId: string, cityId: string): Promise<CityPrice | undefined>;
    listProductPrices(productId: string): Promise<CityPrice[]>;
    upsertProductPrice(data: {
        productId: string;
        cityId: string;
        pricePaise: number;
    }): Promise<CityPrice>;
    getAddonPrice(addonId: string, cityId: string): Promise<AddonCityPrice | undefined>;
    listAddonPrices(addonId: string): Promise<AddonCityPrice[]>;
    upsertAddonPrice(data: {
        addonId: string;
        cityId: string;
        pricePaise: number;
    }): Promise<AddonCityPrice>;
}

export class CityPriceRepository implements ICityPriceRepository {
    async getProductPrice(productId: string, cityId: string): Promise<CityPrice | undefined> {
        const [row] = await db
            .select()
            .from(cityPrices)
            .where(and(eq(cityPrices.productId, productId), eq(cityPrices.cityId, cityId)))
            .limit(1);
        return row;
    }

    async listProductPrices(productId: string): Promise<CityPrice[]> {
        return db.select().from(cityPrices).where(eq(cityPrices.productId, productId));
    }

    async upsertProductPrice(data: {
        productId: string;
        cityId: string;
        pricePaise: number;
    }): Promise<CityPrice> {
        const [row] = await db
            .insert(cityPrices)
            .values(data)
            .onConflictDoUpdate({
                target: [cityPrices.productId, cityPrices.cityId],
                set: { pricePaise: data.pricePaise, updatedAt: new Date() },
            })
            .returning();
        if (!row) {
            throw new Error("failed to upsert product city price");
        }
        return row;
    }

    async getAddonPrice(addonId: string, cityId: string): Promise<AddonCityPrice | undefined> {
        const [row] = await db
            .select()
            .from(addonCityPrices)
            .where(and(eq(addonCityPrices.addonId, addonId), eq(addonCityPrices.cityId, cityId)))
            .limit(1);
        return row;
    }

    async listAddonPrices(addonId: string): Promise<AddonCityPrice[]> {
        return db.select().from(addonCityPrices).where(eq(addonCityPrices.addonId, addonId));
    }

    async upsertAddonPrice(data: {
        addonId: string;
        cityId: string;
        pricePaise: number;
    }): Promise<AddonCityPrice> {
        const [row] = await db
            .insert(addonCityPrices)
            .values(data)
            .onConflictDoUpdate({
                target: [addonCityPrices.addonId, addonCityPrices.cityId],
                set: { pricePaise: data.pricePaise, updatedAt: new Date() },
            })
            .returning();
        if (!row) {
            throw new Error("failed to upsert addon city price");
        }
        return row;
    }
}
