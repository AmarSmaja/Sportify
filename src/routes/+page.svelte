<script lang="ts">
  const cards = [
    {
      title: 'NBA',
      desc: 'Basketball games schedule and results.',
      href: '/nba'
    },
    {
      title: 'Football',
      desc: 'Coming soon (provider not connected yet).',
      href: '/football'
    },
    {
      title: 'NFL',
      desc: 'Coming soon (provider not connected yet).',
      href: '/nfl'
    },
    {
      title: 'MMA',
      desc: 'Coming soon (provider not connected yet).',
      href: '/mma'
    }
  ];
</script>

<h1 class="h1">Sportify</h1>
<p class="lead">
  Select a sport from the header or use the cards below.
</p>

<div class="grid">
  {#each cards as c}
    <a class="card" href={c.href}>
      <div class="cardTitle">{c.title}</div>
      <div class="cardDesc">{c.desc}</div>
      <div class="cardCta">Open →</div>
    </a>
  {/each}
</div>

<style>
  .h1 {
    margin: 0 0 8px 0;
    font-size: 34px;
    letter-spacing: -0.02em;
  }
  .lead {
    margin: 0 0 18px 0;
    opacity: 0.85;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .card {
    display: block;
    text-decoration: none;
    color: inherit;
    border: 1px solid #e5e5e5;
    border-radius: 14px;
    padding: 14px;
    background: white;
  }
  .card:hover {
    background: #fafafa;
    border-color: #ddd;
  }
  .cardTitle {
    font-weight: 700;
    font-size: 18px;
    margin-bottom: 6px;
  }
  .cardDesc {
    opacity: 0.8;
    margin-bottom: 10px;
  }
  .cardCta {
    font-weight: 600;
    opacity: 0.9;
  }
  @media (max-width: 720px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>