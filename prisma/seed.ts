import { PrismaClient } from "@prisma/client";
import { defaultAgents } from "../src/lib/domain";

const prisma = new PrismaClient();

async function main() {
  await prisma.session.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.document.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.roomMembership.deleteMany();
  await prisma.projectRoom.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.team.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Founder",
      email: "founder@feidingwei.local"
    }
  });

  await prisma.user.createMany({
    data: [
      { name: "Business", email: "business@feidingwei.local" },
      { name: "Product", email: "product@feidingwei.local" },
      { name: "Engineer", email: "engineer@feidingwei.local" },
      { name: "QA", email: "qa@feidingwei.local" }
    ]
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "FeiDingWei Labs"
    }
  });

  const businessTeam = await prisma.team.create({
    data: { name: "Business", workspaceId: workspace.id }
  });
  const productTeam = await prisma.team.create({
    data: { name: "Product", workspaceId: workspace.id }
  });
  const engineeringTeam = await prisma.team.create({
    data: { name: "Engineering", workspaceId: workspace.id }
  });
  const qaTeam = await prisma.team.create({
    data: { name: "QA", workspaceId: workspace.id }
  });

  const businessUser = await prisma.user.findUniqueOrThrow({
    where: { email: "business@feidingwei.local" }
  });
  const productUser = await prisma.user.findUniqueOrThrow({
    where: { email: "product@feidingwei.local" }
  });
  const engineerUser = await prisma.user.findUniqueOrThrow({
    where: { email: "engineer@feidingwei.local" }
  });
  const qaUser = await prisma.user.findUniqueOrThrow({
    where: { email: "qa@feidingwei.local" }
  });

  await prisma.membership.createMany({
    data: [
      {
        role: "owner",
        functionLabel: "product",
        userId: user.id,
        workspaceId: workspace.id,
        teamId: productTeam.id
      },
      {
        role: "member",
        functionLabel: "business",
        userId: businessUser.id,
        workspaceId: workspace.id,
        teamId: businessTeam.id
      },
      {
        role: "member",
        functionLabel: "product",
        userId: productUser.id,
        workspaceId: workspace.id,
        teamId: productTeam.id
      },
      {
        role: "member",
        functionLabel: "engineering",
        userId: engineerUser.id,
        workspaceId: workspace.id,
        teamId: engineeringTeam.id
      },
      {
        role: "member",
        functionLabel: "qa",
        userId: qaUser.id,
        workspaceId: workspace.id,
        teamId: qaTeam.id
      }
    ]
  });

  const room = await prisma.projectRoom.create({
    data: {
      name: "Agent Project Room",
      description: "Humans and AI agents turn discussion into project artifacts.",
      workspaceId: workspace.id
    }
  });

  await prisma.roomMembership.createMany({
    data: [
      { role: "room_lead", userId: user.id, roomId: room.id },
      { role: "contributor", userId: businessUser.id, roomId: room.id },
      { role: "room_lead", userId: productUser.id, roomId: room.id },
      { role: "contributor", userId: engineerUser.id, roomId: room.id },
      { role: "reviewer", userId: qaUser.id, roomId: room.id }
    ]
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
