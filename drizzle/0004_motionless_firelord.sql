CREATE TABLE "organization_invitations" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"organization_id" varchar(24) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "organization_member_role" NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;