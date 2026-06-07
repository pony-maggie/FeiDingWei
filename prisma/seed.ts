import { PrismaClient } from "@prisma/client";
import { defaultAgents } from "../src/lib/domain";

const prisma = new PrismaClient();

async function main() {
  await prisma.agentRun.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.document.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.projectRoom.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Founder",
      email: "founder@feidingwei.local"
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "FeiDingWei Labs",
      memberships: {
        create: {
          role: "owner",
          userId: user.id
        }
      }
    }
  });

  const room = await prisma.projectRoom.create({
    data: {
      name: "Agent Project Room",
      description: "Humans and AI agents turn discussion into project artifacts.",
      workspaceId: workspace.id
    }
  });

  await prisma.agent.createMany({
    data: defaultAgents.map((agent) => ({
      slug: agent.slug,
      name: agent.name,
      role: agent.role,
      description: agent.description,
      capabilities: JSON.stringify(agent.capabilities),
      roomId: room.id
    }))
  });

  await prisma.message.createMany({
    data: [
      {
        body: "We need the first version to prove that chat can become tasks and docs.",
        authorId: user.id,
        roomId: room.id
      },
      {
        body: "@PMAgent summarize the launch discussion and create draft tasks.",
        authorId: user.id,
        roomId: room.id
      }
    ]
  });

  await prisma.task.create({
    data: {
      title: "Define the Agent Project Room MVP",
      description: "Capture the first product scope and non-goals.",
      status: "done",
      priority: "high",
      artifactStatus: "active",
      assigneeId: user.id,
      roomId: room.id
    }
  });

  await prisma.document.create({
    data: {
      title: "MVP Positioning",
      body: "FeiDingWei is an open source agent-native workspace for teams.",
      artifactStatus: "active",
      roomId: room.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
