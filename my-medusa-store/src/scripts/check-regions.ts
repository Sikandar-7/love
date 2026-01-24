import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkRegions({ container }: ExecArgs) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    console.log("Checking Regions...");

    const { data: regions } = await query.graph({
        entity: "region",
        fields: ["id", "name", "currency_code", "countries.iso_2"],
    });

    if (regions.length === 0) {
        console.log("NO REGIONS FOUND!");
    } else {
        console.log(`Found ${regions.length} Regions:`);
        regions.forEach((r: any) => {
            console.log(` - Name: ${r.name}, Currency: ${r.currency_code}, Countries: ${r.countries?.map((c: any) => c.iso_2).join(", ")}`);
        });
    }
}
