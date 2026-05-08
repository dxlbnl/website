import { getRegion } from "$lib/utils/location";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ request }) => {
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  const region = getRegion(country);

  return { region, country };
};
