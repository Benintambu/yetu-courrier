import axios from "axios";

export async function searchCity(query, countryCode = "") {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
            q: query,
            format: "json",
            addressdetails: 1,
            limit: 10,
            countrycodes: countryCode // ← filtre par pays si fourni
        },
        headers: {
            "Accept-Language": "fr"
        }
    });

    return res.data;
}
