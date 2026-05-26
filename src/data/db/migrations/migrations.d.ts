/**
 * Type declaration for the Drizzle migration bundle.
 * The migrations.js file is required by the Expo SQLite migrator and
 * cannot be TypeScript because Metro bundler handles .sql imports.
 */
export declare const migrations: {
  journal: {
    entries: {
      idx: number;
      when: number;
      tag: string;
      breakpoints: boolean;
    }[];
  };
  migrations: Record<string, string>;
};
