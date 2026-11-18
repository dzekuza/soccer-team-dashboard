create policy "Authenticated upload for covers"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'covers'::text));


create policy "Public read for covers"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'covers'::text));


create policy "Public read for team-logo"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'team-logo'::text));


create policy "Read 57q2ua_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'ticket-pdfs'::text));


create policy "insd 57q2ua_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'ticket-pdfs'::text));


create policy "public read tickets"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'ticket-pdfs'::text));


create policy "public read"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'ticket-pdfs'::text));


create policy "update 57q2ua_0"
on "storage"."objects"
as permissive
for update
to public
using ((bucket_id = 'ticket-pdfs'::text));


create policy "upload ticket pdfs"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'ticket-pdfs'::text));



