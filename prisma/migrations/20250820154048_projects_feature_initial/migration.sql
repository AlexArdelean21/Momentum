-- CreateTable
CREATE TABLE "public"."activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "emoji" VARCHAR(10) DEFAULT '🎯',
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER DEFAULT 1,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "avatar_url" TEXT,
    "provider" VARCHAR(50) DEFAULT 'credentials',
    "provider_id" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "emoji" VARCHAR(10),
    "progressRequired" BOOLEAN NOT NULL DEFAULT true,
    "repeatsToday" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectSubtask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "target" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSubtask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectProgressLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "subtaskId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "delta" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectProgressLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectDailyStatus" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totals" JSONB NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDailyStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_activities_user_id" ON "public"."activities"("user_id");

-- CreateIndex
CREATE INDEX "idx_activity_logs_activity_id" ON "public"."activity_logs"("activity_id");

-- CreateIndex
CREATE INDEX "idx_activity_logs_date" ON "public"."activity_logs"("date");

-- CreateIndex
CREATE INDEX "idx_activity_logs_user_id" ON "public"."activity_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_logs_activity_id_date_key" ON "public"."activity_logs"("activity_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_users_provider" ON "public"."users"("provider");

-- CreateIndex
CREATE INDEX "idx_users_provider_id" ON "public"."users"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectActivity_userId_name_key" ON "public"."ProjectActivity"("userId", "name");

-- CreateIndex
CREATE INDEX "ProjectSubtask_projectId_idx" ON "public"."ProjectSubtask"("projectId");

-- CreateIndex
CREATE INDEX "ProjectProgressLog_projectId_date_idx" ON "public"."ProjectProgressLog"("projectId", "date");

-- CreateIndex
CREATE INDEX "ProjectProgressLog_subtaskId_date_idx" ON "public"."ProjectProgressLog"("subtaskId", "date");

-- CreateIndex
CREATE INDEX "ProjectDailyStatus_projectId_date_idx" ON "public"."ProjectDailyStatus"("projectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDailyStatus_projectId_date_key" ON "public"."ProjectDailyStatus"("projectId", "date");

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ProjectSubtask" ADD CONSTRAINT "ProjectSubtask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."ProjectActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectProgressLog" ADD CONSTRAINT "ProjectProgressLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."ProjectActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectProgressLog" ADD CONSTRAINT "ProjectProgressLog_subtaskId_fkey" FOREIGN KEY ("subtaskId") REFERENCES "public"."ProjectSubtask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectDailyStatus" ADD CONSTRAINT "ProjectDailyStatus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."ProjectActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
