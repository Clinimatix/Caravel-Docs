---
title: "Overview"
sourcePath: README.md
---

# Clinimatix Caravel

**Expressive applications. Native .NET foundations.**

Clinimatix Caravel is an open-source application framework that brings expressive routing, approachable data access, and integrated command-line tools to .NET. Inspired by Laravel's attention to developer experience, it builds on ASP.NET Core and Entity Framework Core, so the .NET tools and libraries you already know stay within reach.

Use the whole framework, or pick just the packages you need.

Caravel **26.1 is a release candidate**. [Features](#what-you-can-build) · [Quick start](#quick-start) · [Documentation](/v/dev/index) · [Status](#project-status)

```csharp
using Caravel.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.AddCaravel();
var app = builder.Build();
app.UseCaravel();

app.Routes(routes =>
    routes.Get("/hello/{name}", (string name) => $"Hello, {name}!")
        .Name("greeting"));

// Lets `caravel route:list` inspect your routes; otherwise does nothing.
if (await app.ExportCaravelRoutesAsync(args)) return;
await app.RunAsync();
```

## What you can build

- **Expressive routing.** Typed handlers, named routes, and route groups, with ASP.NET Core authorization and metadata at hand.
- **Clarion data access.** Query plain C# models with LINQ, and add timestamps, soft deletes, factories, and seeders. EF Core's relationships, transactions, and concurrency controls are still there when you need them. [Meet Clarion](/v/dev/clarion).
- **Bosun tooling.** The `caravel` command creates Razor or API apps, runs development sessions, lists routes, generates models, jobs and listeners, and manages migrations. [Data commands](/v/dev/bosun-data) · [Development sessions](/v/dev/development).
- **Authentication that fits .NET.** Local Identity accounts with opt-in registration, email confirmation, password recovery and authenticator-app MFA, Windows authentication for intranets, and recipes for OpenID Connect sign-in and bearer-token APIs. [Set up authentication](/v/dev/authentication).
- **Simple events.** Dispatch events to ordered, scoped listeners and test them with a recording fake. [Use events](/v/dev/events).
- **Durable background work.** Save typed jobs in your database, renew leases for longer work, retry failures, replay dead letters, and enqueue recurring work on fixed intervals. An application outbox commits dispatch intent alongside business data. [Queues](/v/dev/queues) · [Scheduling](/v/dev/scheduling).
- **Mail and notifications.** Compose transactional email with templates and attachments, queue delivery, and choose replaceable mail or SMS channels. Development captures make messages easy to test. [Mail](/v/dev/mail) · [Notifications](/v/dev/notifications).
- **Local storage disks.** Stream files into named, application-owned directories with safe, create-only writes. [Use storage](/v/dev/storage).
- **A cohesive foundation.** Service providers, async startup, `.env` configuration, built-in validation, consistent HTTP errors, and queue metrics through standard .NET diagnostics.
- **Practical starting points.** A Razor starter, an API starter with OpenAPI, data and worker samples, and an [authenticated backend sample](/v/dev/backend-sample) that takes you from sign-in to durable processing to reporting.

It is organized into optional packages, so you can take as much or as little as you like:

| Package | What it gives you |
| --- | --- |
| `Clinimatix.Caravel.Core` | Configuration and service providers |
| `Clinimatix.Caravel.AspNetCore` | Routing and web defaults for ASP.NET Core |
| `Clinimatix.Caravel.Clarion` | Data access on EF Core; works in any .NET app |
| `Clinimatix.Caravel.Bosun` | The `caravel` command-line tool |
| `Clinimatix.Caravel.Auth` | ASP.NET Core Identity with secure defaults |
| `Clinimatix.Caravel.Auth.Windows` | Windows (Negotiate) authentication for intranet apps |
| `Clinimatix.Caravel.Events` | In-process events and scoped listeners |
| `Clinimatix.Caravel.Queues` | Durable database jobs and workers |
| `Clinimatix.Caravel.Scheduling` | Fixed-interval schedules that enqueue jobs |
| `Clinimatix.Caravel.Storage` | Streaming local storage disks |
| `Clinimatix.Caravel.Mail` | SMTP email, templates, attachments, capture and queued delivery |
| `Clinimatix.Caravel.Notifications` | Mail/SMS channels, capture and an optional Twilio adapter |

## Quick start

You'll need the [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0). Nothing else is required: no database server, Node, or Docker.

Install Bosun from [NuGet](https://www.nuget.org/packages/Clinimatix.Caravel.Bosun/26.1.0-rc1), then create and run an app. Generated apps restore their Caravel packages from nuget.org; no repository clone or local feed is needed.

```powershell
dotnet tool install --global Clinimatix.Caravel.Bosun --version 26.1.0-rc1
caravel new MyApp
caravel serve --project MyApp
```

You can also run Caravel directly from the release source:

```powershell
git clone --branch v26.1.0-rc1 https://github.com/Clinimatix/Caravel.git
cd Caravel

# Create a new app that references this checkout, then run it
dotnet run --project src/Caravel.Bosun -- new MyApp --framework-source .
dotnet run --project src/Caravel.Bosun -- serve --project MyApp
```

Building a backend? Add `--stack api` to `new` for a starter with request validation, OpenAPI and a health endpoint. Use `dev --project MyApp` when you want .NET to watch for changes.

Other handy commands:

```powershell
caravel route:list --project MyApp   # list your routes
caravel doctor                       # check your setup
```

To add Caravel to an existing application, install only the [packages you need](https://www.nuget.org/profiles/Clinimatix) with an exact version, for example `dotnet add package Clinimatix.Caravel.AspNetCore --version 26.1.0-rc1`. [GitHub release ZIPs](https://github.com/Clinimatix/Caravel/releases) remain available for [local-feed installation](/v/dev/release-policy#using-a-release-zip).

## Learn more

- [Getting started](/v/dev/getting-started): app setup, service providers, validation, and security defaults
- [Configuration](/v/dev/configuration): settings files, `.env`, and environment variables
- [Clarion](/v/dev/clarion): models, queries, soft deletes, factories, and seeders
- [Database providers](/v/dev/database-providers): which databases work today
- [Authentication](/v/dev/authentication): accounts, sign-in and policies
- [Queues](/v/dev/queues) and [the backend sample](/v/dev/backend-sample): durable background work, end to end
- [All documentation](/v/dev/index)

## Project status

The current candidate is **`26.1.0-rc1`**. Its scope includes the application foundation, Clarion data layer, authentication, durable background work, mail and notifications, and Bosun tooling. The documented APIs are settled for release qualification; remaining work toward stable focuses on fixes, upgrade validation and real-application feedback. See the [changelog](/v/dev/changelog).

- **Databases:** SQL Server, PostgreSQL, and SQLite are supported and tested. MariaDB is planned once an EF Core 10–compatible provider is available. See [database providers](/v/dev/database-providers).
- **Coming next:** passkeys, calendar scheduling, cloud storage, more notification channels and starter kits, and AI tooling. See the [roadmap](/v/dev/roadmap).
- **Adoption:** ready for deliberate prerelease evaluation and integration, with exact version pins and a rollback plan. This is not yet a stable release or compatibility commitment; see [versions and releases](/v/dev/release-policy).

This version is a fresh start that replaces an earlier prototype.

## License and stewardship

Clinimatix Caravel is developed and maintained by Clinimatix, LLC and available under the [MIT license](https://github.com/Clinimatix/Caravel/blob/faa6d1b212570eb8f10e10c642aad0beb7a1c36f/LICENSE), with original authorship preserved. Contributions, bug reports, and ideas are welcome. See [Contributing](/v/dev/contributing) and [Security](/v/dev/security).

Clinimatix Caravel is not affiliated with Laravel or Laravel, Inc.
