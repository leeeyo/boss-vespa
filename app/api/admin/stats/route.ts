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

    // Get optional date range parameters
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    
    let dateFilter: { $gte?: Date; $lte?: Date } = {}
    if (startDateParam) {
      dateFilter.$gte = new Date(startDateParam)
    }
    if (endDateParam) {
      const endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59, 999) // Include the entire end date
      dateFilter.$lte = endDate
    }

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

    // Calculate monthly revenue breakdown (last 12 months or filtered range)
    const monthlyMatchFilter: any = { paid: true }
    if (Object.keys(dateFilter).length > 0) {
      monthlyMatchFilter.createdAt = dateFilter
    }
    
    const monthlyBreakdownRaw = await Order.aggregate([
      {
        $match: monthlyMatchFilter,
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          amount: { $sum: '$total' },
        },
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 },
      },
      {
        $limit: 12,
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Fév' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Avr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'Mai' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aoû' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Déc' },
              ],
              default: 'Unknown',
            },
          },
          amount: 1,
        },
      },
    ])
    
    // Reverse to show oldest to newest (left to right in chart)
    const monthlyBreakdown = monthlyBreakdownRaw.reverse()

    // Calculate current and previous month revenue (or filtered period)
    const now = new Date()
    let firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    let firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    // If date filter is provided, use it instead of current month
    if (startDateParam && endDateParam) {
      firstDayThisMonth = new Date(startDateParam)
      const prevMonth = new Date(firstDayThisMonth)
      prevMonth.setMonth(prevMonth.getMonth() - 1)
      firstDayPreviousMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1)
    }

    const currentMonthMatchFilter: any = { paid: true }
    if (startDateParam && endDateParam) {
      currentMonthMatchFilter.createdAt = dateFilter
    } else {
      currentMonthMatchFilter.createdAt = { $gte: firstDayThisMonth }
    }

    const currentMonthRevenue = await Order.aggregate([
      {
        $match: currentMonthMatchFilter,
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ])

    const previousMonthMatchFilter: any = { paid: true }
    if (startDateParam && endDateParam) {
      // For filtered period, calculate previous period of same length
      const periodStart = new Date(startDateParam)
      const periodEnd = new Date(endDateParam)
      const periodLength = periodEnd.getTime() - periodStart.getTime()
      const prevPeriodEnd = new Date(periodStart.getTime() - 1)
      const prevPeriodStart = new Date(prevPeriodEnd.getTime() - periodLength)
      previousMonthMatchFilter.createdAt = {
        $gte: prevPeriodStart,
        $lte: prevPeriodEnd,
      }
    } else {
      previousMonthMatchFilter.createdAt = {
        $gte: firstDayPreviousMonth,
        $lt: firstDayThisMonth,
      }
    }

    const previousMonthRevenue = await Order.aggregate([
      {
        $match: previousMonthMatchFilter,
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ])

    const currentMonth = currentMonthRevenue[0]?.total || 0
    const previousMonth = previousMonthRevenue[0]?.total || 0

    // Calculate growth percentage
    const growth = previousMonth === 0 
      ? (currentMonth > 0 ? 100 : 0)
      : Math.round(((currentMonth - previousMonth) / previousMonth) * 100 * 100) / 100

    // Calculate finished orders count (only paid delivered orders to align with revenue metrics)
    const finishedOrdersCount = await Order.countDocuments({ status: 'delivered', paid: true })

    // Calculate average order value
    const paidOrdersCount = await Order.countDocuments({ paid: true })
    const averageOrderValue = paidOrdersCount > 0 ? revenue / paidOrdersCount : 0

    // Fetch recent paid transactions (optionally filtered by date)
    const recentTransactionsFilter: any = { paid: true }
    if (Object.keys(dateFilter).length > 0) {
      recentTransactionsFilter.createdAt = dateFilter
    }
    
    const recentTransactions = await Order.find(recentTransactionsFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .select('orderId total paymentMethod createdAt status userId')
      .lean()

    const formattedTransactions = recentTransactions.map((transaction: any) => ({
      orderId: transaction.orderId,
      total: transaction.total,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt,
      status: transaction.status,
      userName: transaction.userId?.name || transaction.userId?.email || 'Client',
    }))

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
      revenueDetails: {
        currentMonth,
        previousMonth,
        growth,
        monthlyBreakdown,
        averageOrderValue,
        finishedOrdersCount,
      },
      recentTransactions: formattedTransactions,
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

