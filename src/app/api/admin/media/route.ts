import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    try {
      await stat(uploadsDir);
    } catch {
      return NextResponse.json({ success: true, data: [] });
    }

    const files = await readdir(uploadsDir);
    const mediaFiles = await Promise.all(
      files
        .filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
        .map(async (file) => {
          const fileStat = await stat(join(uploadsDir, file));
          return {
            name: file,
            url: `/uploads/${file}`,
            size: fileStat.size,
          };
        })
    );

    return NextResponse.json({
      success: true,
      data: mediaFiles.sort((a, b) => (b.size || 0) - (a.size || 0)),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
