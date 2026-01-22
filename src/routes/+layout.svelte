<script lang="ts">
  import { page } from '$app/stores';

  const nav = [
    { href: '/', label: 'Home' },
    { href: '/nba', label: 'NBA' },
	{ href: '/cbb', label: 'CBB' },
    { href: '/football', label: 'Football' },
    { href: '/nfl', label: 'NFL' },
	{ href: '/cfb', label: 'CFB' },
    { href: '/mma', label: 'MMA' }
  ];

  function isActive(pathname: string, href: string) {
    if (href === '/') return pathname === '/';
    // aktivno za /nba i sve pod-rute tipa /nba/...
    return pathname === href || pathname.startsWith(href + '/');
  }
</script>

<header class="header">
  <div class="container">
    <a class="brand" href="/">Sportify</a>

    <nav class="nav">
      {#each nav as item}
        <a
          class="navLink"
          class:active={isActive($page.url.pathname, item.href)}
          href={item.href}
        >
          {item.label}
        </a>
      {/each}
    </nav>
  </div>
</header>

<main class="container content">
  <slot />
</main>

<style>
  .header {
    position: sticky;
    top: 0;
    background: white;
    border-bottom: 1px solid #e5e5e5;
    z-index: 10;
  }
  .container {
    max-width: 980px;
    margin: 0 auto;
    padding: 16px;
  }
  .content {
    padding-top: 18px;
  }
  .brand {
    font-weight: 700;
    text-decoration: none;
    color: #111;
    margin-right: 18px;
  }
  .nav {
    display: inline-flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .navLink {
    text-decoration: none;
    color: #111;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid transparent;
  }
  .navLink:hover {
    border-color: #ddd;
    background: #fafafa;
  }

  /* ACTIVE STATE */
  .navLink.active {
    background: #111;
    color: white;
    border-color: #111;
  }
</style>