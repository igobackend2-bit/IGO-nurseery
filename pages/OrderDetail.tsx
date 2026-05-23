import React from 'react';
import { ArrowLeft, Mail, MapPin, Package, Phone, Truck } from 'lucide-react';
import { Order } from '../types';

interface OrderDetailProps {
  order: Order | null;
  isAdminView?: boolean;
  onBack: () => void;
  onStatusChange?: (orderId: string, status: Order['status']) => void;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const STATUS_STYLES: Record<Order['status'], string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-orange-50 text-orange-700 border-orange-200',
  shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  isAdminView = false,
  onBack,
  onStatusChange,
}) => {
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-gray-100 bg-white p-10 text-center shadow-sm">
          <Package className="mx-auto h-16 w-16 text-gray-300" />
          <h1 className="mt-6 text-3xl font-black text-igo-dark">Order not found</h1>
          <p className="mt-3 text-igo-muted">
            We could not find the requested order details in this browser session.
          </p>
          <button
            onClick={onBack}
            className="mt-8 rounded-2xl bg-igo-lime px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-igo-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_35%,_#f5f5f4_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-igo-muted transition-colors hover:text-igo-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          {isAdminView ? 'Back to admin orders' : 'Back to orders'}
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/80 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-5 border-b border-gray-100 pb-8 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-igo-lime">Order Detail</p>
                <h1 className="mt-3 text-3xl font-black text-igo-dark">{order.orderNumber}</h1>
                <p className="mt-2 text-sm text-igo-muted">Tracking number: {order.trackingNumber}</p>
              </div>
              <div className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </div>
            </div>

            <div className="grid gap-6 border-b border-gray-100 py-8 md:grid-cols-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-igo-muted">Placed on</p>
                <p className="mt-2 text-lg font-bold text-igo-dark">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-igo-muted">Payment method</p>
                <p className="mt-2 text-lg font-bold capitalize text-igo-dark">{order.paymentMethod.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-igo-muted">Estimated delivery</p>
                <p className="mt-2 text-lg font-bold text-igo-dark">
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="py-8">
              <h2 className="text-xl font-black text-igo-dark">Items in this order</h2>
              <div className="mt-6 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.product.id}`}
                    className="flex flex-col gap-4 rounded-3xl border border-gray-100 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                      <div>
                        <p className="text-lg font-black text-igo-dark">{item.product.name}</p>
                        <p className="text-sm text-igo-muted">{item.product.category}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-igo-muted">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-black text-green-700">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <section className="rounded-[2rem] border border-white/80 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black text-igo-dark">Customer details</h2>
              <div className="mt-6 space-y-4 text-sm text-igo-dark">
                <p className="text-lg font-black">{order.customerName}</p>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-igo-lime" />
                  <span>{order.customerEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-igo-lime" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-igo-lime" />
                  <span>
                    {order.shippingAddress}, {order.city}, {order.state} {order.zipCode}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/80 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black text-igo-dark">Order summary</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-igo-muted">Subtotal</span>
                  <span className="font-black text-igo-dark">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-igo-muted">Tax</span>
                  <span className="font-black text-igo-dark">{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-igo-muted">Delivery</span>
                  <span className="font-black text-igo-dark">{formatCurrency(order.deliveryCharge)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-base">
                  <span className="font-black text-igo-dark">Total</span>
                  <span className="text-2xl font-black text-green-700">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-igo-lime/30 bg-lime-50 p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-igo-lime" />
                <h2 className="text-xl font-black text-igo-dark">Delivery status</h2>
              </div>
              {isAdminView && onStatusChange ? (
                <div className="mt-6 space-y-3">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-igo-muted">
                    Update order status
                  </label>
                  <select
                    title="Update order status"
                    value={order.status}
                    onChange={(event) => onStatusChange(order.id, event.target.value as Order['status'])}
                    className="w-full rounded-2xl border border-igo-lime/30 bg-white px-4 py-3 text-sm font-bold text-igo-dark outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ) : (
                <p className="mt-4 text-sm text-igo-dark">
                  Your order is currently <span className="font-black capitalize">{order.status}</span>. Keep this
                  order number ready if you contact support.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
