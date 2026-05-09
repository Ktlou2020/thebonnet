insert into public.service_categories (name, slug)
values
  ('General Service', 'general-service'),
  ('Brakes', 'brakes'),
  ('Diagnostics', 'diagnostics'),
  ('Suspension', 'suspension'),
  ('Transmission', 'transmission'),
  ('Panel & Paint', 'panel-paint'),
  ('Aircon', 'aircon'),
  ('EV & Hybrid', 'ev-hybrid'),
  ('Mobile Mechanic', 'mobile-mechanic')
on conflict (slug) do nothing;

insert into public.vehicle_makes (name, slug)
values
  ('Toyota', 'toyota'),
  ('Volkswagen', 'volkswagen'),
  ('Ford', 'ford'),
  ('BMW', 'bmw'),
  ('Mercedes-Benz', 'mercedes-benz'),
  ('Nissan', 'nissan'),
  ('Hyundai', 'hyundai'),
  ('Kia', 'kia'),
  ('Tesla', 'tesla'),
  ('BYD', 'byd')
on conflict (slug) do nothing;

insert into public.price_benchmarks (
  service_category_id,
  vehicle_make_id,
  vehicle_model,
  city,
  low_cents,
  independent_avg_cents,
  high_cents,
  dealership_avg_cents,
  sample_size,
  confidence_label
)
select
  sc.id,
  vm.id,
  'Polo 1.2 TSI',
  'Johannesburg',
  180000,
  220000,
  280000,
  480000,
  42,
  'High'
from public.service_categories sc
cross join public.vehicle_makes vm
where sc.slug = 'brakes' and vm.slug = 'volkswagen'
on conflict (service_category_id, vehicle_make_id, vehicle_model, city) do nothing;

insert into public.price_benchmarks (
  service_category_id,
  vehicle_make_id,
  vehicle_model,
  city,
  low_cents,
  independent_avg_cents,
  high_cents,
  dealership_avg_cents,
  sample_size,
  confidence_label
)
select
  sc.id,
  vm.id,
  'Hilux 2.8 GD-6',
  'Cape Town',
  255000,
  315000,
  410000,
  580000,
  31,
  'High'
from public.service_categories sc
cross join public.vehicle_makes vm
where sc.slug = 'general-service' and vm.slug = 'toyota'
on conflict (service_category_id, vehicle_make_id, vehicle_model, city) do nothing;
