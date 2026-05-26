import crypto from "crypto";

export function generateSignature(data: Record<string, string>, passphrase?: string) {
    let pfOutput = "";

    for (const key of Object.keys(data)) {
        if (data[key] !== "") {
            pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`;
        }
    }

    if (passphrase) {
        pfOutput += `passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
    } else {
        pfOutput = pfOutput.slice(0, -1);
    }

    return crypto.createHash("md5").update(pfOutput).digest("hex");
}