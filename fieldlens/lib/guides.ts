import type { TaskGuide } from '@/types/database';

export const PLUMBING_GUIDES: TaskGuide[] = [
  {
    id: 'plumb-001',
    title: 'Toilet Installation',
    trade: 'plumbing',
    difficulty: 'beginner',
    estimated_minutes: 90,
    description: 'Complete toilet removal and replacement including wax ring, bolts, and supply line.',
    tier_required: 'free',
    steps: [
      {
        index: 0,
        title: 'Shut off water supply',
        instructions: 'Locate the supply valve behind the toilet (left side). Turn clockwise until fully closed. Flush to empty tank and bowl.',
        tools: ['Adjustable wrench'],
        estimated_minutes: 5,
        tips: ['If valve is stuck, use penetrating oil', 'Turn main shutoff if local valve fails'],
        common_errors: ['Skipping water shutoff', 'Not flushing to drain remaining water'],
      },
      {
        index: 1,
        title: 'Disconnect supply line & remove toilet',
        instructions: 'Disconnect supply line from tank. Remove tank bolts. Lift tank off bowl. Remove nuts from floor bolts. Rock toilet side to side to break wax seal. Lift straight up.',
        tools: ['Adjustable wrench', 'Putty knife', 'Bucket'],
        estimated_minutes: 20,
        tips: ['Have rags ready for water', 'Plug flange with rag to block sewer gas'],
        common_errors: ['Breaking porcelain by tilting', 'Forgetting to plug flange'],
        code_reference: 'IPC 420.1',
      },
      {
        index: 2,
        title: 'Prepare flange and set wax ring',
        instructions: 'Clean old wax from flange and floor. Inspect flange for cracks. Install new closet bolts in flange slots. Place wax ring on flange (wax side up) or toilet horn (wax side down).',
        tools: ['Putty knife', 'Wire brush', 'New wax ring', 'New closet bolts'],
        estimated_minutes: 15,
        tips: ['Use extra-thick wax ring if flange is below floor level', 'Never reuse old wax ring'],
        common_errors: ['Using old wax ring', 'Misaligning bolt positions', 'Setting wax ring on toilet upside down'],
        code_reference: 'IPC 405.4.3',
      },
      {
        index: 3,
        title: 'Set toilet and torque bolts',
        instructions: 'Lower toilet straight down over bolts, aligning bolt holes. Press firmly with full body weight to compress wax. Hand-tighten nuts. Alternate sides to level. Final torque: firm but not over-tight (porcelain cracks easily).',
        tools: ['Adjustable wrench', 'Level', 'Plastic caps'],
        estimated_minutes: 15,
        tips: ['Check level in both directions', 'Snap off excess bolt length with hacksaw'],
        common_errors: ['Over-tightening bolts (cracks porcelain)', 'Not leveling toilet', 'Moving toilet after wax contact'],
      },
      {
        index: 4,
        title: 'Reconnect and test',
        instructions: 'Reconnect supply line. Turn water on slowly. Let tank fill. Flush 2-3 times. Check all connections for leaks. Inspect wax seal by checking floor around base.',
        tools: ['Adjustable wrench', 'Flashlight'],
        estimated_minutes: 10,
        tips: ['Use thread tape on supply line threads', 'Wait 24 hours to caulk base'],
        common_errors: ['Cross-threading supply line', 'Forgetting to check for leaks', 'Caulking too soon'],
      },
    ],
  },
  {
    id: 'plumb-002',
    title: 'P-Trap Replacement',
    trade: 'plumbing',
    difficulty: 'beginner',
    estimated_minutes: 30,
    description: 'Replace a leaking or damaged P-trap under a kitchen or bathroom sink.',
    tier_required: 'free',
    steps: [
      {
        index: 0,
        title: 'Place bucket and remove old trap',
        instructions: 'Place bucket under trap. Loosen slip nut at drain tailpiece. Loosen slip nut at wall stub-out. Remove P-trap and empty water.',
        tools: ['Channel-lock pliers', 'Bucket', 'Rags'],
        estimated_minutes: 10,
        tips: ['Hand-loosen first, then use pliers only if needed'],
        common_errors: ['Forgetting bucket', 'Stripping plastic nuts with overtightening'],
      },
      {
        index: 1,
        title: 'Dry-fit new trap',
        instructions: 'Dry-fit new P-trap without washers. Ensure correct alignment. P-trap must have water seal (2" minimum). Adjust arm length as needed by cutting with hacksaw.',
        tools: ['Hacksaw', 'Marker'],
        estimated_minutes: 10,
        tips: ['Arm should slope slightly down toward wall (1/4" per foot)'],
        common_errors: ['Wrong slope direction', 'Arm too long causing S-trap configuration'],
        code_reference: 'IPC 1002.1',
      },
      {
        index: 2,
        title: 'Assemble with washers and test',
        instructions: 'Insert tapered washers correctly (flat side toward nut). Hand-tighten all slip nuts. Give each nut 1/4 turn with pliers. Run water 30 seconds. Check every joint.',
        tools: ['Channel-lock pliers'],
        estimated_minutes: 10,
        tips: ['Washers go beveled side INTO fitting', 'Only snug-tight — not wrench-tight'],
        common_errors: ['Backwards washers', 'Over-tightening causing cracks', 'Missing washers'],
      },
    ],
  },
  {
    id: 'plumb-003',
    title: 'Water Heater Replacement',
    trade: 'plumbing',
    difficulty: 'intermediate',
    estimated_minutes: 180,
    description: 'Replace a tank water heater including connections, expansion tank, and code compliance.',
    tier_required: 'pro',
    steps: [
      {
        index: 0,
        title: 'Shut off gas/electricity and water',
        instructions: 'Turn off gas valve (perpendicular to pipe = off). Or turn off circuit breaker for electric. Turn off cold water supply to heater.',
        tools: ['Adjustable wrench'],
        estimated_minutes: 10,
        tips: ['Wait 2 hours for water to cool before draining'],
        common_errors: ['Not verifying gas is off with meter or soap test'],
        code_reference: 'IPC 502.1',
      },
      {
        index: 1,
        title: 'Drain the tank',
        instructions: 'Connect garden hose to drain valve near bottom. Run to floor drain or outside. Open pressure relief valve or a hot water faucet to let air in. Open drain valve.',
        tools: ['Garden hose', 'Bucket'],
        estimated_minutes: 30,
        tips: ['40-gallon tank takes 20-30 minutes to drain'],
        common_errors: ['No air vent causing vacuum lock', 'Draining on grass (kills grass)'],
      },
      {
        index: 2,
        title: 'Disconnect pipes and remove old heater',
        instructions: 'Disconnect union fittings or cut pipes 6" above heater. For gas: disconnect gas flex connector. For electric: cap wires. Remove pressure relief valve. Dispose of old unit.',
        tools: ['Pipe cutter', 'Channel-lock pliers', 'Electrical tape'],
        estimated_minutes: 30,
        tips: ['Photograph connections before disconnecting'],
        common_errors: ['Cutting pipe too short', 'Not capping electrical wires'],
      },
      {
        index: 3,
        title: 'Install new heater and connect',
        instructions: 'Position heater. Install new pressure relief valve with discharge pipe to within 6" of floor. Connect supply/return with dielectric unions. Connect gas flex or rewire electrical.',
        tools: ['Pipe wrench', 'Teflon tape', 'Thread compound'],
        estimated_minutes: 60,
        tips: ['Dielectric unions required where copper meets steel', 'Check local code for expansion tank requirement'],
        common_errors: ['No dielectric unions', 'Short P&T relief discharge pipe', 'Missing drip leg on gas'],
        code_reference: 'IPC 504.6',
      },
      {
        index: 4,
        title: 'Fill, test, and light pilot',
        instructions: 'Open cold supply valve. Open hot water faucet to purge air. When steady stream flows, close faucet. Check all connections for leaks. For gas: follow lighting instructions. For electric: turn on breaker.',
        tools: ['Soap solution bottle'],
        estimated_minutes: 20,
        tips: ['Check P&T relief valve operation annually'],
        common_errors: ['Turning on heat before tank is full', 'Not checking gas connections with soap'],
      },
    ],
  },
];

export const ALL_GUIDES = [...PLUMBING_GUIDES];

export function getGuideById(id: string): TaskGuide | undefined {
  return ALL_GUIDES.find((g) => g.id === id);
}

export function getGuidesByTrade(trade: string): TaskGuide[] {
  return ALL_GUIDES.filter((g) => g.trade === trade);
}
