import { join } from "path";
import { zip, COMPRESSION_LEVEL } from "zip-a-small-folder";
import { readdir, stat } from 'fs/promises';

export async function compress(dir_path: string) {
    console.log("Crompressing", dir_path);
    return zip(dir_path, join(dir_path, "../a.zip"), { compression: COMPRESSION_LEVEL.high });
}

export async function dirSize(dir: string) {
    const files = await readdir( dir, { withFileTypes: true } );
  
    const paths:any = files.map( async file => {
      const path = join( dir, file.name );
  
      if ( file.isDirectory() ) return await dirSize( path );
  
      if ( file.isFile() ) {
        const { size } = await stat( path );
        
        return size;
      }
  
      return 0;
    } );
  
    return ( await Promise.all( paths ) ).flat( Infinity ).reduce( ( i, size ) => i + size, 0 );
  }
  