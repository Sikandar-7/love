import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import * as fs from "fs";
import * as path from "path";

export default async function dumpKey({ container }: ExecArgs) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    console.log("Dumping key...");

    const { data: keys } = await query.graph({
        entity: "api_key",
        fields: ["token", "title"],
        filters: {
            type: "publishable",
        },
    });

    if (keys.length > 0) {
        const key = keys[0].token;
        fs.writeFileSync("key.txt", key);
        console.log("Key written to key.txt");
    } else {
        console.log("No key found");
    }
}
