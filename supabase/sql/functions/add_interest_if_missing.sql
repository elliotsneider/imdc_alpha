
-- supabase/sql/functions/add_interest_if_missing.sql

create or replace function add_interest_if_missing(
  user_id uuid,
  category_label text,
  item_label text,
  item_attributes text default null
) returns void as $$
declare
  cat_id uuid;
  item_id uuid;
begin
  select id into cat_id from categories where label = category_label;
  if cat_id is null then
    insert into categories (label) values (category_label) returning id into cat_id;
  end if;

  select id into item_id from loves
  where category_id = cat_id and label = item_label;
  if item_id is null then
    insert into loves (category_id, label, attributes)
    values (cat_id, item_label, item_attributes)
    returning id into item_id;
  end if;

  insert into interest_links (user_id, item_id)
  values (user_id, item_id)
  on conflict do nothing;
end;
$$ language plpgsql;
