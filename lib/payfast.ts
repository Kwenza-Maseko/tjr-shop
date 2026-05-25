import crypto from "crypto";

export function generateSignature(data: Record<string, string>, passphrase?: string) {
    let pfOutput = "";

    for (let keyValue in data) {
        if (data[keyValue] !== "") {
            pfOutput += `${keyValue}=${encodeURIComponent(data[keyValue].trim()).replace(/%20/g, "+")}&`;
        }
    }

    if (passphrase) {
        pfOutput += `passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
    } else {
        pfOutput = pfOutput.slice(0, -1);
    }

    return crypto.createHash("md5").update(pfOutput).digest("hex");
}