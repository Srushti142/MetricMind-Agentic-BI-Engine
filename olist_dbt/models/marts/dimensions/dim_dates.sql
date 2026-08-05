select distinct
    cast(try_to_timestamp(order_purchase_timestamp) as date) as order_date,
    extract(year from try_to_timestamp(order_purchase_timestamp)) as year,
    extract(month from try_to_timestamp(order_purchase_timestamp)) as month,
    extract(day from try_to_timestamp(order_purchase_timestamp)) as day,
    extract(quarter from try_to_timestamp(order_purchase_timestamp)) as quarter,
    extract(dayofweek from try_to_timestamp(order_purchase_timestamp)) as day_of_week
from {{ ref('stg_orders') }}
where try_to_timestamp(order_purchase_timestamp) is not null
