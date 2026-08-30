import type {
    Client,
    Pool,
    PoolConfig,
    QueryResult,
    QueryResultRow,
    TypeOverrides,
} from "@stackline/types-pg";

interface UserRow extends QueryResultRow {
    id: number;
    name: string;
}

const config: PoolConfig = {
    connectionString: "postgres://localhost/example",
    max: 4,
    pipeline: true,
};

declare const pool: Pool;
declare const client: Client;
declare const overrides: TypeOverrides;
declare const result: QueryResult<UserRow>;

void config;
void pool;
void client;
void overrides;
void result.rows[0]?.name;
