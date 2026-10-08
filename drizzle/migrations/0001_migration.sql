ALTER TABLE public.orders ADD COLUMN payment_status text NOT NULL DEFAULT 'pay_on_collection';
ALTER TABLE public.orders ADD COLUMN yoco_checkout_id text;
CREATE UNIQUE INDEX orders_yoco_checkout_idx ON public.orders(yoco_checkout_id) WHERE yoco_checkout_id IS NOT NULL;

CREATE TABLE public.payment_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  yoco_webhook_id text,
  yoco_webhook_secret text,
  yoco_mode text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;