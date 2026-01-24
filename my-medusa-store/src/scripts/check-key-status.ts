import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkKeyStatus({ container }: ExecArgs) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    console.log("Checking Publishable Keys...");

    const { data: keys } = await query.graph({
        entity: "api_key",
        fields: ["token", "id", "title", "sales_channels.*"],
        filters: {
            type: "publishable",
        },
    });

    if (keys.length === 0) {
        console.log("NO PUBLISHABLE KEYS FOUND!");
        return;
    }

    keys.forEach((k: any) => {
        console.log(`------------------------------------------------`);
        console.log(`Title: ${k.title}`);
        console.log(`Token: ${k.token}`);
        console.log(`ID: ${k.id}`);
        console.log(`Linked Sales Channels: ${k.sales_channels?.length || 0}`);

        if (k.sales_channels) {
            k.sales_channels.forEach((sc: any) => {
                console.log(` - Channel: ${sc.name} (ID: ${sc.id})`);
            });
        } else {
            console.log("WARNING: This key is NOT linked to any Sales Channel!");
        }
        console.log(`------------------------------------------------`);
    });
}
