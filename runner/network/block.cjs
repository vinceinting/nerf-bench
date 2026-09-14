// Network-layer web block (R-09). Runs on the GitHub-hosted runner only (needs root / admin).
// Linux: the agent runs under a dedicated group; iptables logs and rejects every packet from that
// group except to the local proxy, which tunnels only the vendor's hosts. Windows: outbound is
// blocked by default for every program except the proxy's node.exe and the Actions runner itself.
'use strict';
const { execFileSync } = require('child_process');

const GROUP = 'nbnet';

function sh(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function linuxRules(port) {
  return [
    ['groupadd', '-f', GROUP],
    ['iptables', '-A', 'OUTPUT', '-m', 'owner', '--gid-owner', GROUP, '-o', 'lo', '-p', 'tcp', '--dport', String(port), '-j', 'ACCEPT'],
    ['iptables', '-A', 'OUTPUT', '-m', 'owner', '--gid-owner', GROUP, '-j', 'LOG', '--log-prefix', 'NBBLOCK '],
    ['iptables', '-A', 'OUTPUT', '-m', 'owner', '--gid-owner', GROUP, '-j', 'REJECT'],
    ['ip6tables', '-A', 'OUTPUT', '-m', 'owner', '--gid-owner', GROUP, '-j', 'REJECT'],
  ];
}

function windowsRules(nodeExe, runnerDir) {
  return [
    ['netsh', 'advfirewall', 'firewall', 'add', 'rule', 'name=nb-allow-proxy', 'dir=out', 'action=allow', `program=${nodeExe}`, 'enable=yes'],
    ['netsh', 'advfirewall', 'firewall', 'add', 'rule', 'name=nb-allow-runner-worker', 'dir=out', 'action=allow', `program=${runnerDir}\\bin\\Runner.Worker.exe`, 'enable=yes'],
    ['netsh', 'advfirewall', 'firewall', 'add', 'rule', 'name=nb-allow-runner-listener', 'dir=out', 'action=allow', `program=${runnerDir}\\bin\\Runner.Listener.exe`, 'enable=yes'],
    ['netsh', 'advfirewall', 'set', 'allprofiles', 'logging', 'droppedconnections', 'enable'],
    ['netsh', 'advfirewall', 'set', 'allprofiles', 'firewallpolicy', 'blockinbound,blockoutbound'],
  ];
}

// Applies the rules; prefix is ['sudo'] on Linux runners.
function apply({ port, platform = process.platform, prefix = ['sudo'], nodeExe = process.execPath, runnerDir = process.env.RUNNER_HOME || 'C:\\actions-runner' }) {
  const rules = platform === 'win32' ? windowsRules(nodeExe, runnerDir) : linuxRules(port).map((r) => [...prefix, ...r]);
  for (const [cmd, ...args] of rules) sh(cmd, args);
  return rules.map((r) => r.join(' '));
}

// How the agent process is launched inside the block (Linux: keep the uid, switch the group).
function wrap(cmd, args, platform = process.platform) {
  if (platform === 'win32') return { cmd, args };
  return { cmd: 'sudo', args: ['-E', '-g', GROUP, '--', cmd, ...args] };
}

// Kernel-side refusals (direct connections that bypassed the proxy), for the run log.
function kernelRefusals(platform = process.platform) {
  try {
    if (platform === 'win32') return sh('powershell', ['-NoProfile', '-Command', 'Get-Content $env:SystemRoot\\System32\\LogFiles\\Firewall\\pfirewall.log -Tail 200 | Select-String DROP']).split(/\r?\n/).filter(Boolean);
    return sh('sudo', ['dmesg']).split('\n').filter((l) => l.includes('NBBLOCK'));
  } catch (e) {
    return [`<refusal log unreadable: ${e.message}>`];
  }
}

module.exports = { apply, wrap, kernelRefusals, linuxRules, windowsRules, GROUP };
