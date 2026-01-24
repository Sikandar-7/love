import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function getPublishableKey({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: "api_key",
    fields: ["token", "title"],
    filters: {
      type: "publishable",
    },
  });

  if (data.length === 0) {
    console.log("No publishable keys found.");
  } else {
    console.log("Found Publishable Keys:");
    data.forEach((key: any) => {
        console.log(`Key: ${key.token}`);
    });
  }
}
