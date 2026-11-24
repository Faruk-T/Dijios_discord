declare const uuidV7Brand: unique symbol;
declare const ulidBrand: unique symbol;
declare const isoTimestampBrand: unique symbol;

export type UuidV7 = string & { readonly [uuidV7Brand]: "UUIDv7" };

export type Ulid = string & { readonly [ulidBrand]: "ULID" };

export type IsoTimestamp = string & { readonly [isoTimestampBrand]: "ISO-8601" };

export interface IdentifiableEntity {
  readonly id: UuidV7;
  readonly publicId: Ulid;
  readonly createdAt: IsoTimestamp;
  readonly updatedAt: IsoTimestamp;
}

export interface TenantScoped {
  readonly institutionId: UuidV7;
}

export interface TenantScopedEntity extends IdentifiableEntity, TenantScoped {}

export interface CursorPaginatedResult<TItem, TCursor = UuidV7 | Ulid | string> {
  readonly items: readonly TItem[];
  readonly nextCursor: TCursor | null;
  readonly hasMore: boolean;
}
