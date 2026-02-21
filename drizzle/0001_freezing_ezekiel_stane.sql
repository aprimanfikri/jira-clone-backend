ALTER TABLE "subtasks" ADD COLUMN "key" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_key_unique" UNIQUE("key");