#PHPEPL - Fork

This is a fork of the original PHPEPL made by Mr. Joel Kemp at https://github.com/mrjoelkemp/phpepl.

##The changes from the original version:

- Added Snippets support
    - Store multiple snippets in `localStorage` with proper names.
    - Navigate through them in the sidebar.
    - Double click name of the Snippet in the title bar to rename it.
- A darker and nicer theme. Codemirror editor now uses the monokai theme.
- Convenient code functions:
	- Typing `>` in the last line of the code followed by any variables or literals, and omitting the `;` semicolon will wrap the statement in `var_dump`.
	- So `> $x, 'foo', bar()` will be transferred to the eval script as `var_dump($x, 'foo', bar())`. Rest of the code will remain as it is.
	- Omitting the semi-colon at the end is necessary (and convenient?). This is done to ensure only intended format of code is replaced.
	- Replacement happens only on the last line.
- Include one snippet in another with custom comment like `/*!include <snippet name>*/`
	- Snippet code will be parsed like above (including nested includes) before inclusion
	- Inclusion is simply copying over of the code
	- Looping includes will throw an `Include-ception` error
	- Snippet names are case-sensitive
	- There must not be any extra space anywhere in the custom comment
- Files are automatically saved, just use `Ctrl+Enter` to run code. No `Ctrl+S`.
- Removed the timestamp thing.
- Removed the spinner, can be re-enabled by un-commenting the respective lines.
- Removed dependency on jQuery, added a small DOM module instead.
- Removed moment.js dependency. It was used only for a little timestamp, which is removed. And the timestamp can done in lesser code without moment.js anyways.
- Simplified code and directory structure. Removed the build engine since there is a very small amount of code, and is fairly optimized already. The build engine was not minifying Codemirror's code anyways. Removal of jQuery and moment.js already speeds up page a lot.
- Removed Vagrant, docker etc. Setting up and usage of the app is already pretty simple. Nginx config is included anyways.

~~**Note: The eval script is the same.**~~
The original eval script replaced all instances of `<?php`, `<?`, and `?>` in your code with empty strings without verifying their positions. This is almost brutal :(. Now the front-end script does it, but only if the occurrence is at the beginning or end. Less brutal.

##To use:

Clone this repo to filesystem. Open the folder in terminal, make sure you have composer installed, and run `composer install`.
Then start a server within the folder either with the inbuilt php server:
```
php -S localhost:<port>
```
Then point your browser to `http://localhost:<port>`. (Replacing port with whatever port you want to use). Or add `phpepl.local` to your `hosts` file (located in `/etc/`) and add the `phpepl.conf` nginx configuration to your nginx configuration folder, and restart nginx. Then access the app at `http://phpepl.local`. Remember to replace the root path in the conf file with the place wherever you place the app.

Happy PHPing ;-)

---

Credits to Mr. Joel Kemp (@mrjoelkemp) for the original PHP eval script.

###Screenshots

![stuff](http://i.imgur.com/I9YTWX3.png "stuff")

![filtering on the sidebar](http://i.imgur.com/ttxC8nH.png "filtering on the sidebar")
