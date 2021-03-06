(function () {
	// Extend RegExp object to include a quote method
	RegExp.quote = function(str) {
		return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	};

	/**
	 * Checks a passwords security against a set of safety rules
	 * @param  {string} password        User entered password
	 * @param  {string} password_repeat (Optional) Second user password (to check against typing mistakes)
	 * @param  {object} form            (Optional) HTML form element where to look for user input that shouldn't
	 * be in the password. Use a "data-ignore" attribute on any element that shouldn't be checked against
	 * if needed.
	 * @param  {array} 	blacklist       (Optional) List of Regexp patterns that should reject the password.
	 * @return {object}                 Password check result
	 */
	window.checkPasswordSecurity = function (password, password_repeat, form, blacklist)
	{
		var score = 0;

		// Password and its repeat don't match, stop here
		if (password_repeat !== null && password !== password_repeat)
		{
			return {
				password_match: false,
				fail:			true,
				security:		null,
				score: 			score,
			};
		}

		// Short passwords are too easily bruteforced
		if (password.length < 8)
		{
			return {
				password_match: false,
				fail:			true,
				security:		'short',
				score: 			1,
			};
		}

		if (form)
		{
			var inputs = form.getElementsByTagName('input');

			// Find all user text entry in the form and try to find if any word from any
			// input is also in the password, this is to rate stuff like SurnameName1988
			for (var i = 0; i < inputs.length; i++)
			{
				var input = inputs[i];
				var type = input.type.toLowerCase();

				// Only use user entry text
				if (type != 'text' && type != 'email' && type != 'url' && type != 'tel')
				{
					continue;
				}

				// Empty input
				if (input.value.replace(/\s/, '') == '' || input.getAttribute('data-ignore'))
				{
					continue;
				}

				// Split words (\W = non-word characters)
				var v = input.value.split(/[\W]+/);

				for (var j = 0; j < v.length; j++)
				{
					// Don't match against words too short
					if (v[j].length < 4)
						continue;

					var r = new RegExp(RegExp.quote(v[j]), 'i');

					if (password.match(r))
					{
						return {
							password_match: true,
							fail:			true,
							security:		'personal_data',
							score: 			0,
						};
					}
				}
			}
		}

		if (blacklist)
		{
			for (var i = 0; i < blacklist.length; i++)
			{
				if (blacklist[i].test(password))
				{
					return {
						password_match: true,
						fail:			true,
						security:		'blacklist',
						score: 			0,
					};
				}
			}
		}

		score += scorePassword(password);

		var security = 'none';

		if (score > 80)
			security = 'good';
		else if (score > 60)
			security = 'medium';
		else if (score >= 30)
			security = 'low';

		return {
			password_match: true,
			fail:			(score < 30) ? true : false,
			security:		security,
			score: 			score,
		};
	};

	function scorePassword (pass) {
		var score = 0;

		// Match any birthday year
		if (/(19\d{2}|20[0-2]\d)/g.test(pass))
		{
			score -= 15;
		}

		// Every unique letter awarded, up to 5
		var letters = new Object();

		for (var i = 0; i < pass.length; i++)
		{
			letters[pass[i]] = (letters[pass[i]] || 0) + 1;
			score += 5.0 / letters[pass[i]];
		}

		// Bonus points for mixing other characters
		var variations = {
			digits: /\d/.test(pass),
			lower: /[a-z]/.test(pass),
			upper: /[A-Z]/.test(pass),
			nonWords: /\W/.test(pass),
		};

		variationCount = 0;
		for (var check in variations)
		{
			variationCount += (variations[check] == true) ? 1 : 0;
		}

		score += (variationCount - 1) * 10;

		return parseInt(score);
	}
}());