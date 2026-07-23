select
    o.order_id,
    o.customer_id,
    oi.product_id,
    oi.seller_id,
    op.payment_type,
    op.payment_value,
    r.review_score,
    o.order_purchase_timestamp,
    o.order_delivered_customer_date,
    oi.price,
    oi.freight_value
from {{ ref('stg_orders') }} o
left join {{ ref('stg_order_items') }} oi
    on o.order_id = oi.order_id
left join {{ ref('stg_order_payments') }} op
    on o.order_id = op.order_id
left join {{ ref('stg_order_reviews') }} r
    on o.order_id = r.order_id
    