import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'AUTHOR'].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true } },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: 'خبر یافت نشد' },
        { status: 404 }
      );
    }

    // Authors can only see their own articles
    if ((session.user as any).role === 'AUTHOR' && article.authorId !== (session.user as any).id) {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'AUTHOR'].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title, subtitle, content, excerpt, categoryId, featuredImage,
      status, isFeatured, isBreaking, isPinned, placement, source, sourceUrl,
      scheduledAt, metaTitle, metaDesc, metaKeywords, tagIds, region
    } = body;

    const existingArticle = await prisma.article.findUnique({ where: { id } });
    if (!existingArticle) {
      return NextResponse.json(
        { success: false, message: 'خبر یافت نشد' },
        { status: 404 }
      );
    }

    // Check AUTHOR permissions
    const userRole = (session.user as any).role;
    if (userRole === 'AUTHOR') {
      const author = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { permissions: true },
      });
      const perms: string[] = JSON.parse(author?.permissions || '[]');

      // Can only edit own articles
      if (existingArticle.authorId !== (session.user as any).id) {
        return NextResponse.json({ success: false, message: 'فقط می‌توانید اخبار خود را ویرایش کنید' }, { status: 403 });
      }
      // Cannot publish directly without publish permission
      if (status === 'PUBLISHED' && !perms.includes('publish')) {
        return NextResponse.json({ success: false, message: 'دسترسی انتشار مستقیم ندارید. وضعیت درخواستی: PENDING' }, { status: 403 });
      }
    }

    let slug = existingArticle.slug;
    if (title && title !== existingArticle.title) {
      slug = title
        .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      
      const existingSlug = await prisma.article.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'PUBLISHED' && !existingArticle.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isBreaking !== undefined) updateData.isBreaking = isBreaking;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (placement !== undefined) updateData.placement = placement;
    if (source !== undefined) updateData.source = source;
    if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDesc !== undefined) updateData.metaDesc = metaDesc;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;
    if (region !== undefined) updateData.region = region;
    if (slug !== existingArticle.slug) updateData.slug = slug;

    if (tagIds !== undefined) {
      updateData.tags = {
        set: tagIds.map((tagId: string) => ({ id: tagId })),
      };
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    });

    // ارسال خودکار خبرنامه هنگام انتشار
    if (status === 'PUBLISHED' && existingArticle.status !== 'PUBLISHED') {
      try {
        const { sendNewsletterToAll } = await import('@/lib/email');
        await sendNewsletterToAll(
          article.title,
           `<h2 style="color: #1B365D;">${article.title}</h2>
           <p style="color: #666;">${article.category?.name ?? ''}</p>
           ${article.excerpt ? `<p>${article.excerpt}</p>` : ''}
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/news/${article.slug}" style="display:inline-block;background:#C9A96E;color:#1B365D;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:bold;margin-top:10px;">ادامه مطلب</a>`
        );
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'خبر با موفقیت به‌روزرسانی شد',
      data: article,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'AUTHOR'].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, message: 'غیرمجاز' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const article = await prisma.article.findUnique({ where: { id } });
    
    if (!article) {
      return NextResponse.json(
        { success: false, message: 'خبر یافت نشد' },
        { status: 404 }
      );
    }

    // Check AUTHOR permissions
    const userRole = (session.user as any).role;
    if (userRole === 'AUTHOR') {
      const author = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { permissions: true },
      });
      const perms: string[] = JSON.parse(author?.permissions || '[]');
      if (article.authorId !== (session.user as any).id) {
        return NextResponse.json({ success: false, message: 'فقط می‌توانید اخبار خود را حذف کنید' }, { status: 403 });
      }
      if (!perms.includes('delete_own')) {
        return NextResponse.json({ success: false, message: 'دسترسی حذف خبر ندارید' }, { status: 403 });
      }
    }

    await prisma.article.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'خبر با موفقیت حذف شد',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
