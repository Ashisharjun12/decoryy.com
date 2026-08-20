import { ApiError } from "@/shared/errors/apiError.js";
import { isForeignKeyViolation } from "@/modules/geo/pg-error.js";
import type { IAddonRepository } from "@/modules/catalog/addons/addon.repository.js";
import type { IProductRepository } from "@/modules/catalog/products/product.repository.js";
import type { ICityPriceRepository } from "@/modules/catalog/pricing/city-price.repository.js";
import type { AddonCityPrice, CityPrice } from "@/modules/catalog/pricing/city-price.schema.js";

export type PriceQuote = {
    productId: string;
    cityId: string;
    addonIds: string[];
    productPaise: number;
    addonsPaise: number;
    totalPaise: number;
};

export interface ICityPriceService {
    listProductPrices(productId: string): Promise<CityPrice[]>;
    setProductPrice(productId: string, cityId: string, pricePaise: number): Promise<CityPrice>;
    listAddonPrices(addonId: string): Promise<AddonCityPrice[]>;
    setAddonPrice(addonId: string, cityId: string, pricePaise: number): Promise<AddonCityPrice>;
    quote(productId: string, cityId: string, addonIds: string[]): Promise<PriceQuote>;
}

export class CityPriceService implements ICityPriceService {
    constructor(
        private readonly prices: ICityPriceRepository,
        private readonly products: IProductRepository,
        private readonly addons: IAddonRepository,
    ) {}

    async listProductPrices(productId: string): Promise<CityPrice[]> {
        const product = await this.products.findById(productId);
        if (!product) {
            throw ApiError.notFound("product not found");
        }
        return this.prices.listProductPrices(productId);
    }

    async setProductPrice(productId: string, cityId: string, pricePaise: number): Promise<CityPrice> {
        const product = await this.products.findById(productId);
        if (!product) {
            throw ApiError.notFound("product not found");
        }
        try {
            return await this.prices.upsertProductPrice({ productId, cityId, pricePaise });
        } catch (err) {
            if (isForeignKeyViolation(err)) {
                throw ApiError.badRequest("city not found");
            }
            throw err;
        }
    }

    async listAddonPrices(addonId: string): Promise<AddonCityPrice[]> {
        const addon = await this.addons.findById(addonId);
        if (!addon) {
            throw ApiError.notFound("addon not found");
        }
        return this.prices.listAddonPrices(addonId);
    }

    async setAddonPrice(addonId: string, cityId: string, pricePaise: number): Promise<AddonCityPrice> {
        const addon = await this.addons.findById(addonId);
        if (!addon) {
            throw ApiError.notFound("addon not found");
        }
        try {
            return await this.prices.upsertAddonPrice({ addonId, cityId, pricePaise });
        } catch (err) {
            if (isForeignKeyViolation(err)) {
                throw ApiError.badRequest("city not found");
            }
            throw err;
        }
    }

    async quote(productId: string, cityId: string, addonIds: string[]): Promise<PriceQuote> {
        const product = await this.products.findById(productId);
        if (!product) {
            throw ApiError.notFound("product not found");
        }
        const productPrice = await this.prices.getProductPrice(productId, cityId);
        if (!productPrice) {
            throw ApiError.badRequest("product is not priced for this city");
        }
        const uniqueAddonIds = [...new Set(addonIds)];
        let addonsPaise = 0;
        for (const addonId of uniqueAddonIds) {
            const mapped = await this.addons.isMapped(productId, addonId);
            if (!mapped) {
                throw ApiError.badRequest("addon is not mapped to this product");
            }
            const addonPrice = await this.prices.getAddonPrice(addonId, cityId);
            if (!addonPrice) {
                throw ApiError.badRequest("addon is not priced for this city");
            }
            addonsPaise += addonPrice.pricePaise;
        }
        return {
            productId,
            cityId,
            addonIds: uniqueAddonIds,
            productPaise: productPrice.pricePaise,
            addonsPaise,
            totalPaise: productPrice.pricePaise + addonsPaise,
        };
    }
}
