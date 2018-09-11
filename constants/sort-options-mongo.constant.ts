import {SortOptions} from "@sugoi/orm";

export const SortOptionsMongo: { [direction: string]: number } = {
    [SortOptions.DESC]: -1,
    [SortOptions.ASC]: 1
};