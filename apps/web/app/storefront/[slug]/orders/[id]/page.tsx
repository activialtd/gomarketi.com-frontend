import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Clock, Truck, Package, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface OrderItem {
  name: string;
  quantity: number;
  price_kobo: number;
  image_url: string;
}

interface OrderData {
  id: string;
  status: string;
  total_kobo: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  delivery_address: string;
  items: OrderItem[];
}

function fmt(kobo: number) {
  return '₦' + (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

async function getOrder(orderId: string, email: string): Promise<OrderData | null> {
  try {
    const res = await fetch(
      `${API_URL}/v1/orders/public/${orderId}?email=${encodeURIComponent(email)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return (await res.json()) as OrderData;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id.slice(0, 8).toUpperCase()}` };
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Order placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
] as const;

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

function statusIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { slug, id } = await params;
  const sp = await searchParams;
  const email = sp.email ?? '';

  const shopUrl = `/storefront/${slug}/shop`;

  // If no email provided in query, show generic message
  if (!email) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#f0fdf4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle
            style={{ width: '32px', height: '32px', color: '#22c55e' }}
          />
        </div>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#1C1C1C',
            marginBottom: '8px',
          }}
        >
          Order received!
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            maxWidth: '380px',
            margin: '0 auto 24px',
            lineHeight: 1.6,
          }}
        >
          Check your email for order confirmation and tracking details. Your
          order number is{' '}
          <strong style={{ color: '#1C1C1C' }}>
            #{id.slice(0, 8).toUpperCase()}
          </strong>
          .
        </p>
        <Link
          href={shopUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--store-primary, #1A7A42)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '13px',
            fontWeight: 800,
          }}
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  // Try to fetch order data
  const order = await getOrder(id, email);

  // Order not found or email mismatch
  if (!order) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <XCircle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
        </div>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#1C1C1C',
            marginBottom: '8px',
          }}
        >
          Order not found
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            maxWidth: '380px',
            margin: '0 auto 24px',
            lineHeight: 1.6,
          }}
        >
          We couldn&apos;t find an order matching that ID and email address.
          Please check your confirmation email or contact the store for help.
        </p>
        <Link
          href={shopUrl}
          style={{
            color: 'var(--store-primary, #1A7A42)',
            fontWeight: 700,
            fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          ← Back to store
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const currentStep = isCancelled ? -1 : statusIndex(order.status);

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '40px 24px 80px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href={shopUrl}
          style={{
            fontSize: '12px',
            color: '#6b7280',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '16px',
          }}
        >
          ← Continue shopping
        </Link>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <p
              style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}
            >
              Order
            </p>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#1C1C1C',
                letterSpacing: '-0.3px',
              }}
            >
              #{order.id.slice(0, 8).toUpperCase()}
            </h1>
          </div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              background: isCancelled
                ? '#fef2f2'
                : order.status === 'delivered'
                  ? '#f0fdf4'
                  : '#f0faf3',
              color: isCancelled
                ? '#dc2626'
                : order.status === 'delivered'
                  ? '#16a34a'
                  : 'var(--store-primary, #1A7A42)',
              textTransform: 'capitalize',
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            {/* connector line */}
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                right: '18px',
                height: '2px',
                background: '#e2e8f0',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                height: '2px',
                width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                background: 'var(--store-primary, #1A7A42)',
                transition: 'width 0.4s ease',
                zIndex: 1,
              }}
            />

            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const Icon = step.icon;
              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 2,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: done
                        ? 'var(--store-primary, #1A7A42)'
                        : '#fff',
                      border: `2px solid ${done ? 'var(--store-primary, #1A7A42)' : '#e2e8f0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Icon
                      style={{
                        width: '16px',
                        height: '16px',
                        color: done ? '#fff' : '#d1d5db',
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: '10px',
                      fontWeight: done ? 700 : 500,
                      color: done ? '#1C1C1C' : '#9ca3af',
                      textAlign: 'center',
                      lineHeight: 1.3,
                    }}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order items */}
      <div
        style={{
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: '#fafafa',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: 800, color: '#1C1C1C' }}>
            Order items
          </p>
        </div>
        {order.items.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px 20px',
              borderBottom:
                i < order.items.length - 1 ? '1px solid #f9fafb' : 'none',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '10px',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
              }}
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1C1C1C',
                  lineHeight: 1.3,
                }}
              >
                {item.name}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                Qty: {item.quantity}
              </p>
            </div>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: 'var(--store-primary, #1A7A42)',
                flexShrink: 0,
              }}
            >
              {fmt(item.price_kobo * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div
        style={{
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Total</span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#1C1C1C',
            }}
          >
            {fmt(order.total_kobo)}
          </span>
        </div>
        <div
          style={{
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#94a3b8',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Delivery address
          </p>
          <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>
            {order.delivery_address}
          </p>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
        Questions? Contact the store or reply to your confirmation email.
      </p>
    </div>
  );
}
