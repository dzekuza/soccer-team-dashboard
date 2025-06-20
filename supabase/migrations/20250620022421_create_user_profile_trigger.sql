-- Function to create a public user profile when a new user signs up in auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'admin');
  return new;
end;
$$;

-- Trigger to call the function when a new user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant permissions for the function
grant execute on function public.handle_new_user() to postgres, authenticated, service_role; 