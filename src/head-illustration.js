/**
 * Original, source-informed schematic. Paths are authored for this project;
 * no external mesh, illustration, photograph or anatomical segmentation used.
 * See design/v3/assets.md for source and the scientific-review boundary.
 * Animation is owned by the host scene, never by this SVG.
 */
export function headIllustration(prefix = 'head') {
  const id = String(prefix).replace(/[^a-zA-Z0-9_-]/g, '') || 'head';
  const profile = 'M192 594 C235 578 258 550 260 517 C262 485 251 458 226 432 C197 404 175 382 163 343 C148 294 150 230 168 181 C188 125 224 89 281 77 C344 63 407 81 441 123 C468 156 477 196 466 235 C461 253 466 274 480 296 L510 331 C518 341 509 349 491 352 L479 354 C479 362 483 367 489 373 C486 377 480 380 476 381 C478 386 483 388 484 394 C490 408 480 426 465 436 C450 446 429 449 411 445 C387 450 372 465 368 487 C364 508 365 528 372 541 C394 558 425 574 461 591';
  const cerebrum = 'M190 279 C174 258 171 232 180 209 C177 184 193 164 214 157 C219 134 239 121 263 122 C281 105 305 105 325 114 C348 104 373 115 385 131 C411 133 429 151 431 172 C451 187 454 208 445 227 C454 249 443 269 425 278 C418 300 397 310 377 304 C356 323 335 326 315 315 C294 330 271 326 262 312 C241 321 221 312 218 296 C204 296 195 290 190 279 Z';
  const folds = [
    'M216 159 C210 176 212 190 230 195 C246 199 244 214 234 222',
    'M265 123 C248 140 252 155 264 162 C280 170 277 183 266 191 C253 201 258 215 270 220',
    'M322 115 C310 133 317 143 307 156 C293 173 309 188 302 200',
    'M382 133 C369 144 349 139 344 153 C339 167 357 177 347 191 C338 204 320 199 315 216',
    'M427 173 C409 168 398 176 398 190 C398 205 381 209 374 198',
    'M444 225 C425 213 415 220 411 233 C408 246 391 250 382 239',
    'M424 277 C410 267 397 273 391 286',
    'M373 304 C370 287 357 281 343 290 C330 299 316 291 316 278',
    'M313 314 C298 299 302 282 286 277 C268 272 265 285 266 309',
    'M219 294 C232 278 251 278 250 262 C249 249 234 245 222 252 C207 260 194 251 191 239',
    'M181 208 C199 206 204 219 200 230',
    'M286 225 C285 240 299 248 308 236 C318 224 338 229 344 242',
    'M218 158 C237 151 240 138 257 139',
    'M231 195 C221 209 222 225 238 234',
    'M271 160 C287 151 296 136 291 118',
    'M345 153 C329 143 334 125 352 119',
    'M347 191 C357 211 371 214 385 215',
    'M401 189 C416 191 428 198 430 209',
    'M222 252 C207 277 226 281 240 276',
    'M264 247 C277 242 274 228 265 220',
    'M329 266 C345 269 357 258 350 247',
    'M379 241 C365 233 350 241 350 252',
  ];
  return `<svg class="human-illustration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 680" role="img" aria-labelledby="${id}-title ${id}-description">
    <title id="${id}-title">A human head, the brain within it, and a schematic scalp recording</title>
    <desc id="${id}-description">Original simplified illustration of a non-identifiable person in profile, facing right. Layers reveal the brain within the upper head, then five scalp contacts connected to recording leads. The anatomy and contact placement are schematic, not a medical image or electrode montage.</desc>
    <defs>
      <linearGradient id="${id}-skin" x1="0" y1="0" x2="1" y2="0.55">
        <stop offset="0" stop-color="#DCC6BF"/><stop offset=".36" stop-color="#F5E3D8"/><stop offset=".72" stop-color="#F9EBE2"/><stop offset="1" stop-color="#DFB7A9"/>
      </linearGradient>
      <linearGradient id="${id}-neck" x1="0" y1="0" x2="1" y2=".4">
        <stop stop-color="#BEA6A3"/><stop offset=".53" stop-color="#E9D0C4"/><stop offset="1" stop-color="#F8E7DC"/>
      </linearGradient>
      <linearGradient id="${id}-hair" x1="0" y1=".2" x2=".9" y2=".9">
        <stop stop-color="#4C525A"/><stop offset=".55" stop-color="#293540"/><stop offset="1" stop-color="#172431"/>
      </linearGradient>
      <linearGradient id="${id}-brain" x1=".1" y1="0" x2=".8" y2="1">
        <stop stop-color="#F7D5CE"/><stop offset=".45" stop-color="#E5AFA7"/><stop offset="1" stop-color="#CA8D89"/>
      </linearGradient>
      <linearGradient id="${id}-cerebellum" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#EBC3BE"/><stop offset="1" stop-color="#B77979"/>
      </linearGradient>
      <linearGradient id="${id}-shirt" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#DCE7F3"/><stop offset="1" stop-color="#B8CFE8"/>
      </linearGradient>
      <clipPath id="${id}-brain-clip"><path d="${cerebrum}"/></clipPath>
    </defs>

    <g data-anatomy="surface" opacity="1">
      <path d="M104 650 C119 610 165 592 209 576 L247 550 C273 569 334 573 372 541 L407 565 C457 582 505 606 526 650 Z" fill="url(#${id}-shirt)"/>
      <path d="M226 416 C257 445 270 479 260 517 C255 543 245 563 228 579 C261 612 340 617 402 564 L372 541 C364 528 364 507 368 487 C372 465 387 450 411 445 L349 395 Z" fill="url(#${id}-neck)"/>
      <path d="M264 452 C275 501 292 547 324 576 C300 579 280 574 266 566 C275 527 254 481 249 466 Z" fill="#AA8681" opacity=".21"/>
      <path d="${profile}" fill="url(#${id}-skin)" stroke="#AB928F" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M258 372 C284 383 299 401 328 407 C363 418 387 423 415 419 C389 438 366 450 358 478 C346 451 329 437 300 431 C279 420 267 400 258 372 Z" fill="#B9948D" opacity=".17"/>
      <path d="M389 260 C397 285 397 315 411 334 C423 350 438 353 457 348 C444 371 431 387 405 392 C391 369 377 347 379 318 C381 294 388 276 389 260 Z" fill="#FFF6EC" opacity=".32"/>
      <path d="M167 334 C149 288 151 230 169 181 C189 125 225 89 281 77 C344 63 407 81 441 123 C451 136 459 152 464 168 C452 159 434 155 416 158 C393 159 380 149 368 136 C343 151 317 165 287 178 C270 187 257 215 251 251 L239 300 C227 302 220 314 219 336 L210 366 C193 357 178 347 167 334 Z" fill="url(#${id}-hair)"/>
      <path d="M178 211 C199 150 236 110 294 99 C340 90 387 101 419 124" fill="none" stroke="#88919A" stroke-width="2.6" opacity=".32" stroke-linecap="round"/>
      <path d="M174 242 C194 186 216 158 251 141 M181 282 C194 246 209 213 231 190 M217 159 C249 125 280 113 321 111 M258 171 C297 147 331 127 360 123 M290 166 C324 146 345 135 366 130" fill="none" stroke="#A8ADB3" stroke-width="1.8" opacity=".24" stroke-linecap="round"/>
      <path d="M230 320 C228 301 241 288 255 292 C274 297 279 320 271 343 C267 356 259 370 248 372 C237 373 232 362 233 351" fill="#E8C9BA" stroke="#B5928B" stroke-width="2.2"/>
      <path d="M240 339 C235 324 242 306 253 311 C262 315 260 329 254 335 C246 337 246 343 251 348 M240 349 C244 357 251 356 255 351" fill="none" stroke="#A17D78" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M407 269 C422 258 442 259 454 269" fill="none" stroke="#665953" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M411 281 C425 277 438 280 446 287 C433 289 424 288 415 286" fill="#F9F5EF"/>
      <path d="M411 281 C425 277 438 280 446 287" fill="none" stroke="#705C55" stroke-width="2.7" stroke-linecap="round"/>
      <ellipse cx="435" cy="284" rx="3.4" ry="4" fill="#26333A"/>
      <path d="M448 292 C454 308 462 319 470 328 C477 336 488 339 498 336" fill="none" stroke="#B18B80" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M478 346 C480 342 487 342 490 345" fill="none" stroke="#947067" stroke-width="3" stroke-linecap="round"/>
      <path d="M455 373 C465 368 476 370 489 373 C477 380 467 380 456 377 Z" fill="#BD897E" opacity=".77"/>
      <path d="M456 375 C467 376 478 375 486 374" fill="none" stroke="#865C55" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M459 392 C466 395 474 395 480 392" fill="none" stroke="#AD8277" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M265 369 C282 394 314 417 348 424" fill="none" stroke="#BF9E91" stroke-width="1.8" stroke-linecap="round" opacity=".65"/>
    </g>

    <g data-anatomy="brain" opacity="0">
      <path d="M263 306 C276 313 293 323 303 341 C302 358 299 373 309 395 L325 432 C319 440 307 440 302 432 C291 408 277 389 275 370 C270 357 257 348 250 338 Z" fill="#D6B1A9" stroke="#A77875" stroke-width="2.4"/>
      <path d="M204 314 C188 322 181 343 188 361 C194 381 217 394 239 391 C257 389 270 376 273 360 C274 345 265 329 252 321 C236 311 218 309 204 314 Z" fill="url(#${id}-cerebellum)" stroke="#A77875" stroke-width="2.4"/>
      <g fill="none" stroke="#AB7372" stroke-width="2" stroke-linecap="round" opacity=".78">
        <path d="M199 326 C220 320 243 326 259 340 M194 336 C218 329 246 338 266 350 M192 347 C217 338 247 350 269 361 M195 358 C219 350 244 361 264 371 M202 369 C222 361 243 372 255 379 M212 379 C225 375 236 381 242 385"/>
      </g>
      <path d="${cerebrum}" fill="url(#${id}-brain)" stroke="#A96F70" stroke-width="2.5" stroke-linejoin="round"/>
      <g clip-path="url(#${id}-brain-clip)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#BA7C7B" stroke-width="7" opacity=".4">${folds.map(d=>`<path d="${d}"/>`).join('')}</g>
        <g stroke="#996C6D" stroke-width="2.25" opacity=".84">${folds.map(d=>`<path d="${d}"/>`).join('')}</g>
        <path d="M207 230 C234 222 248 239 266 246 C289 258 308 257 329 265 C348 274 368 270 389 258" stroke="#8F6164" stroke-width="4.2" opacity=".77"/>
        <path d="M215 233 C239 229 249 243 266 250 C289 262 306 261 325 269" stroke="#F9DDD3" stroke-width="2.2" opacity=".65"/>
        <path d="M193 183 C212 151 241 138 268 136 M336 129 C370 128 405 153 420 178 M201 276 C225 297 243 294 254 297" stroke="#FFE4D9" stroke-width="3.5" opacity=".6"/>
      </g>
    </g>

    <g data-anatomy="scalp" opacity="1" fill="none" stroke="#576981" stroke-linecap="round" stroke-linejoin="round">
      <path d="${profile}" stroke-width="2.1" opacity=".55"/>
      <path d="M230 320 C228 301 241 288 255 292 C274 297 279 320 271 343 C267 356 259 370 248 372 C237 373 232 362 233 351 M240 339 C235 324 242 306 253 311 C262 315 260 329 254 335" stroke-width="1.7" opacity=".42"/>
      <path d="M411 281 C425 277 438 280 446 287 M455 375 C467 376 478 375 486 374 M478 346 C480 342 487 342 490 345" stroke-width="1.8" opacity=".38"/>
    </g>

    <g data-anatomy="leads" opacity="0" fill="none" stroke="#2659E8" stroke-width="2.8" stroke-linecap="round">
      <path d="M172 180 C148 110 204 42 316 42 C434 42 532 91 566 150 C600 210 602 240 660 240"/>
      <path d="M226 100 C227 69 270 52 330 58 C444 65 526 110 553 161 C587 225 606 255 660 255"/>
      <path d="M310 73 C334 48 408 82 449 107 C514 145 521 196 551 230 C576 259 613 270 660 270"/>
      <path d="M406 94 C443 90 478 114 494 147 C527 216 557 285 660 285"/>
      <path d="M468 205 C502 208 511 230 533 252 C569 286 607 300 660 300"/>
      <path d="M660 226 L678 226 L678 314 L660 314" stroke-width="2"/>
      <path d="M678 270 L712 270" stroke-width="4"/>
    </g>
    <g data-anatomy="electrodes" opacity="0" fill="#2659E8" stroke="#F4F8FC" stroke-width="4">
      <circle cx="172" cy="180" r="10"/><circle cx="226" cy="100" r="10"/>
      <circle cx="310" cy="73" r="10"/><circle cx="406" cy="94" r="10"/>
      <circle cx="468" cy="205" r="10"/>
    </g>
  </svg>`;
}
