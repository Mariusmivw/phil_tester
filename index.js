const child_process = require('child_process');
const path = require('path');


const num_of_phils = parseInt(process.argv[2]);
const time_to_die = parseInt(process.argv[3]);
const time_to_eat = parseInt(process.argv[4]);
const time_to_sleep = parseInt(process.argv[5]);
let min_eats = Infinity;
if (process.argv >= 7)
	min_eats = parseInt(process.argv[6]);
const args = process.argv.slice(2).join(' ');

const proc = child_process.exec(`ARGS="${args}" make SAN_THREAD= VERBOSE=1 DEBUG=1 run | grep -e "is eating" -e "died"`, {
	cwd: path.resolve(__dirname, '../philo'),
	timeout: 10000
});
const stop_proc = ()=>{
	proc.kill();
}
let text = '';
let timeout = null;
proc.stdout.on('data', (chunk) => {
	if (timeout != null)
		clearTimeout(timeout);
	timeout = setTimeout(stop_proc, 2000);
	text += chunk.toString();
	process_lines(text.slice(0, text.lastIndexOf('\n')).split('\n'));
	text = text.slice(text.lastIndexOf('\n') + 1);
})

let	last_eat = [];
function process_lines(lines)
{
	const died = lines[lines.length - 1].endsWith('died');
	const [_, deadTime, deadPhil] = died ? lines[lines.length - 1].match(/^\[(\d+)\] (\d+)/) : [];
	outer: for (let i = 1; i <= num_of_phils; i++)
	{
		const endString = ` ${i} is eating`;
		const eating = lines.filter((v)=>v.endsWith(endString));
		for (const line of eating)
		{
			const cur = parseInt(line.slice(1));
			if (last_eat[i] != undefined)
			{
				if (last_eat[i] + time_to_die < cur)
				{
					console.log(`${i} has risen from the dead`);
					// stop_proc();
					// break outer;
				}
			}
			last_eat[i] = cur;
		}
		if (died && deadPhil == i)
		{
			if (last_eat[i] + time_to_die + 10 < deadTime)
				console.log(`${i} died too late`);
			else
				console.log(`${i} died in time`);
		}
	}
}
