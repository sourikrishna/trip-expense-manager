let members = []
let expenses = []

function createMembers() {

	let count = document.getElementById("memberCount").value
	let div = document.getElementById("members")

	div.innerHTML = ""

	for (let i = 0; i < count; i++) {
		div.innerHTML += `<input placeholder="Member ${i + 1}" id="m${i}">`
	}

	div.innerHTML += `<button onclick="saveMembers(${count})">Start Trip</button>`

}

function saveMembers(count) {

	members = []

	for (let i = 0; i < count; i++) {
		members.push(document.getElementById("m" + i).value)
	}

	document.getElementById("expenseSection").classList.remove("hidden")

	let paid = document.getElementById("paidBy")
	paid.innerHTML = ""

	members.forEach((m, i) => {
		paid.innerHTML += `<option value="${i}">${m}</option>`
	})

	let partDiv = document.getElementById("participants")
	partDiv.innerHTML = ""

	members.forEach((m, i) => {

		partDiv.innerHTML += `

			<label class="participant-row">

				<input type="checkbox" class="participant" value="${i}" checked>

				<span>${m}</span>

			</label>

		`

	})

}

function toggleUnequal() {

	let section = document.getElementById("unequalSection")
	section.innerHTML = ""

	if (document.getElementById("unequalToggle").checked) {

		members.forEach((m, i) => {

			section.innerHTML += `
				<label>${m}</label>
				<input type="number" placeholder="Custom amount" id="custom${i}">
			`

		})

	}

}

function addExpense() {

	let desc = document.getElementById("desc").value
	let total = parseFloat(document.getElementById("amount").value)
	let paidBy = parseInt(document.getElementById("paidBy").value)

	let selected = document.querySelectorAll(".participant:checked")

	let part = []
	selected.forEach(p => part.push(parseInt(p.value)))

	let shares = new Array(members.length).fill(0)

	let unequal = document.getElementById("unequalToggle").checked

	if (!unequal) {

		let equalShare = total / part.length
		part.forEach(i => shares[i] = equalShare)

	} else {

		let customTotal = 0
		let remaining = []

		part.forEach(i => {

			let custom = document.getElementById("custom" + i)

			if (custom && custom.value) {

				shares[i] = parseFloat(custom.value)
				customTotal += shares[i]

			} else {

				remaining.push(i)

			}

		})

		let remainAmount = total - customTotal
		let equalShare = remainAmount / remaining.length
		remaining.forEach(i => shares[i] = equalShare)

	}

	expenses.push({ desc, total, paidBy, shares })

	renderExpenses()

	document.getElementById("desc").value = ""
	document.getElementById("amount").value = ""

	document.getElementById("unequalToggle").checked = false
	document.getElementById("unequalSection").innerHTML = ""

}

function renderExpenses() {

	let list = document.getElementById("expenseList")
	list.innerHTML = ""

	expenses.forEach((e, index) => {

		list.innerHTML += `

			<div class="expense-card">

				<div>
					<strong>${e.desc}</strong><br>
					₹${e.total} • Paid by ${members[e.paidBy]}
				</div>

				<button onclick="deleteExpense(${index})">Delete</button>

			</div>

		`

	})

}

function deleteExpense(index) {

	expenses.splice(index, 1)
	renderExpenses()

}

function calculate() {

	let balance = new Array(members.length).fill(0)

	expenses.forEach(e => {
		e.shares.forEach((s, i) => balance[i] -= s)
		balance[e.paidBy] += e.total
	})

	let debtors = []
	let creditors = []

	balance.forEach((b, i) => {

		if (b < 0)
			debtors.push({ person: i, amount: Math.abs(b) })

		if (b > 0)
			creditors.push({ person: i, amount: b })

	})

	let result = ""

	while (debtors.length && creditors.length) {

		let d = debtors[0]
		let c = creditors[0]

		let pay = Math.min(d.amount, c.amount)

		result += `

			<div class="settlement">

				<div>${members[d.person]} pays ${members[c.person]}</div>

				<div class="amount">₹${pay.toFixed(2)}</div>

			</div>

		`

		d.amount -= pay
		c.amount -= pay

		if (d.amount == 0) debtors.shift()
		if (c.amount == 0) creditors.shift()

	}

	document.getElementById("result").innerHTML = result

}