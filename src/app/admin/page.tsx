'use client';

import { ShoppingCart, DollarSign, MessageSquare, UserPlus, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAdminMetrics } from '@/hooks/use-admin';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: metrics, isLoading } = useAdminMetrics();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const cards = [
    {
      title: 'Orders Today',
      value: metrics?.ordersToday ?? 0,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Revenue',
      value: `$${((metrics?.totalRevenue ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      href: '/admin/orders',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending Chats',
      value: metrics?.pendingChats ?? 0,
      icon: MessageSquare,
      href: '/admin/chat',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'New Users Today',
      value: metrics?.newUsers ?? 0,
      icon: UserPlus,
      href: '/admin/users',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your platform activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{card.value}</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
