import { join } from "path";
import { zip, COMPRESSION_LEVEL } from "zip-a-folder";

export async function compress(dir_path: string) {
    console.log("Crompressing", dir_path);
    return zip(dir_path, join(dir_path, "../a.zip"), { compression: COMPRESSION_LEVEL.high });
}
