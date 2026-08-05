select
    geolocation_zip_code_prefix,
    geolocation_city,
    geolocation_state,
    avg(geolocation_lat) as latitude,
    avg(geolocation_lng) as longitude
from {{ ref('stg_geolocation') }}
group by
    geolocation_zip_code_prefix,
    geolocation_city,
    geolocation_state
    