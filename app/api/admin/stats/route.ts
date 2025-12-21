import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Personalization from '@/models/Personalization'
import Devis from '@/models/Devis'
import Blog from '@/models/Blog'
import { requireAdmin, handleError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof NextResponse) return admin

    await connectDB()

    const [
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalProducts,
      activeProducts,
      totalPersonalizations,
      pendingPersonalizations,
      totalDevis,
      pendingDevis,
      totalBlogPosts,
      publishedBlogPosts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([
        {
          $match: { paid: true },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Personalization.countDocuments(),
      Personalization.countDocuments({ status: 'pending' }),
      Devis.countDocuments(),
      Devis.countDocuments({ status: 'pending' }),
      Blog.countDocuments(),
      Blog.countDocuments({ isPublished: true }),
    ])

    const revenue = totalRevenue[0]?.total || 0

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          revenue: 1,
        },
      },
    ])

    return NextResponse.json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        recent: recentOrders,
      },
      revenue: {
        total: revenue,
        currency: 'TND',
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      },
      personalizations: {
        total: totalPersonalizations,
        pending: pendingPersonalizations,
      },
      devis: {
        total: totalDevis,
        pending: pendingDevis,
      },
      blog: {
        total: totalBlogPosts,
        published: publishedBlogPosts,
      },
      topProducts,
    })
  } catch (error) {
    return handleError(error, 'Failed to fetch statistics')
  }
}

