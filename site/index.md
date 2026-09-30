---
title: Documentation
---

# Build with Clinimatix Caravel

Expressive applications. Native .NET foundations. Learn the framework from your first route through data access, application services, and a repeatable development workflow on .NET 10 LTS.

::: info 26.1 Public Preview 1
**26.1.0-rc1** is Caravel’s first public preview and first release candidate. These guides document its release snapshot, with installation guidance updated for NuGet availability. Public previews are for evaluation and integration ahead of stable release. <a href="/releases/26.1.0-rc1/">Preview notes</a> · [Compatibility and adoption](v/26.1.0-rc1/release-policy.md).
:::

## Start building

- [Overview and quick start](v/26.1.0-rc1/overview.md)
- [Application setup](v/26.1.0-rc1/getting-started.md)
- [Browse every guide](v/26.1.0-rc1/index.md)

## Install the public preview

Requires the .NET 10 SDK. Install [Bosun from NuGet](https://www.nuget.org/packages/Clinimatix.Caravel.Bosun/26.1.0-rc1), then create and run an application:

```powershell
dotnet tool install --global Clinimatix.Caravel.Bosun --version 26.1.0-rc1
caravel new MyApp
caravel serve --project MyApp
```

All twelve packages are available on [nuget.org](https://www.nuget.org/profiles/Clinimatix). Select **Include prerelease** in Visual Studio and pin `26.1.0-rc1`. See the [installation guide](v/26.1.0-rc1/release-policy.md#using-prerelease-packages) to add packages to an existing app. [GitHub ZIPs and local feeds](v/26.1.0-rc1/release-policy.md#using-a-release-zip) remain an alternative.

## A quick look at routing

Define routes in an ordinary ASP.NET Core application. Caravel keeps native .NET tools within reach.

```csharp
using Caravel.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.AddCaravel();
var app = builder.Build();
app.UseCaravel();

app.Routes(routes =>
    routes.Get("/hello/{name}", (string name) => $"Hello, {name}!")
        .Name("greeting"));

if (await app.ExportCaravelRoutesAsync(args)) return;
await app.RunAsync();
```

## Explore the framework

- [Clarion data access](v/26.1.0-rc1/clarion.md) — models, queries, transactions and soft deletes on EF Core.
- [Authentication](v/26.1.0-rc1/authentication.md) — opt-in registration, email confirmation, password recovery, authenticator-app MFA and recovery codes; separate guides cover OIDC, bearer tokens and Windows sign-in.
- [Queues and workers](v/26.1.0-rc1/queues.md) — durable jobs, renewable leases, retries, recovery and transactional outbox dispatch.
- [Transactional mail](v/26.1.0-rc1/mail.md) — SMTP, templates, attachments, capture and queued delivery.
- [Mail and SMS notifications](v/26.1.0-rc1/notifications.md) — replaceable channels, independent retries and a Twilio adapter.
- [Bosun tooling](v/26.1.0-rc1/bosun-data.md) — models, migrations and seeders from the command line.
- [Backend walkthrough](v/26.1.0-rc1/backend-sample.md) — see authentication and background processing together.

## Choose your documentation

The [RC1 docs](v/26.1.0-rc1/overview.md) stay pinned to the published release. The separate [development docs](v/dev/overview.md) track a reviewed source snapshot and are labeled unreleased, even when their source currently matches RC1. Use [documentation versions](versions.md) or the version selector to switch.

Review the [RC1 changelog](v/26.1.0-rc1/changelog.md) and [roadmap](v/26.1.0-rc1/roadmap.md) for current limits and future work. Account screens, passkeys, calendar scheduling, cloud storage and AI/MCP remain planned. Mail/SMS delivery needs verification with your chosen provider; SMS delivery is not SMS MFA.
