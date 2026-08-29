import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { execSync } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const body = await req.json();
    const { backupPath, shutdown } = body;

    const src = 'D:\\MyProgect\\liandid';
    const dst = backupPath || `D:\\MyProgect\\backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)}`;

    const cmd = `powershell -Command "New-Item -ItemType Directory -Path '${dst}' -Force | Out-Null; Get-ChildItem '${src}' -Exclude 'node_modules','.next','backup_*','seed-category.js','shutdown.ps1' | Copy-Item -Destination '${dst}' -Recurse -Force"`;
    
    execSync(cmd, { timeout: 120000 });

    if (shutdown) {
      setTimeout(() => {
        try {
          execSync('taskkill /F /IM node.exe', { timeout: 5000 });
        } catch {}
      }, 2000);
    }

    return NextResponse.json({ success: true, message: 'بکاپ با موفقیت ذخیره شد', path: dst });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطا در ایجاد بکاپ' }, { status: 500 });
  }
}
