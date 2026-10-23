/**
 * SlimeBeep: a beep messenger for Bondage Club (chats, group chats, online friends, WaveBeep).
 *
 * The whole add-on is this file, served from GitHub Pages and loaded by FUSAM, the bookmarklet or
 * the slimebeep.user.js loader. Group chats and mailboxes use the relay in relay/.
 * Release with `node release.js <version>`.
 */
(function () {
	'use strict';
	/** URL this copy was loaded from, or '' when it was injected as text. Read by the start-up check. */
	const LOADED_FROM = (document.currentScript instanceof HTMLScriptElement && document.currentScript.src) || '';

	const VERSION = '3.8.2';
	// Only one copy runs per page.
	if (window.SlimeBeep) {
		return;
	}
	window.SlimeBeep = { version: VERSION };

	/** The slime logo (toggle button, Extensions page), as a data URL. */
	const ICON =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAh8UlEQVR42u2beZxdVZXvv2uf4Q51a65UKmQkCWQikIF5CGFGEEQkiIiCioL4nLsdUKxEaafWFsUGEbRBbIXEfqCAoKBJQAZJCIGEzAmpylSpSs13Pmfv9f44FQZH7H7df7zn/tStz53OPXuvvdZvrfVba8Pfx9/H38f/z0P+M9coKrBs5NpFCqgg+v+8tJSl3p/7bDntfiKY/6m5qChLveW0+4AHGMC0c6r/3zUXAaj1atCJOl3rVp0V1T15jk7W2XqbBq9OrN38j26EAfEMoR/i+X4ihpGxlKXeXxPEG5WSMWKczT191R3Dyz78PBtnV6gGBsHHc1OZtOXt2fP/fexJ539LHpWCstQTLrX/HbsuiABOl2rI+9ad+ejw8oUd7JpWplTv45XHMqbzlNQxv2+YecbD8rzsfc11+p8SgKImlMA9n7r71pvLd12bn6Gcd/oF7vDj5zi/NaDzma3m8bsfNru3dXChOX3d5aOWvEP2y0u3cVtwLddE+n938YiIuvo1V3x/4EeffZ5NM/3JWeqnjiJTn6VSrNC/o5vyxkEmMab/namL7pg096J2eUZKSrsRlri/6aZLR1StL/Pode/jTL3hrGvL+rWdVf0PjbVLrQ6rVVWrazR+atG95YsaT9IvcdUBbRs69aCAR+zR/FdsUlFZxCJPF6m3If3vP/gQ5+lHz71Sn/7tymq5VKyoavXgw8ZRZcOaFyrtV39C38kCfcT7l2f0UB0N0P63mKcm2iHaruG/8MFtV8290OonN1TLlz9jSzfuiItvedwWDv+ZLZ35iC19d6PVGzts/8derL5nxlv0Os4vd9c++hFV/VOgaf7Ew3sVvJZ6f4gjS1nqGTFszP7ktqs4Xe/45nfLqhqpqo36C7bSOxSXewbiSt9QHA3kY7VqVTVe+fCj5Qtrj9UHwq8/o6dqWml/4xtx8Is6X8dcw1mFW677qtWb8pG+c3XVvuupih79UKTjfxYX09+PKxN+aksffMLqu56yumRX9JWzPmUv4yT9Jh987qXwpx/V1sqRukhztV4NoRcSeAGhF5LyUgR+gHgmEcMfTK2ddn89S0MAbdx8/id4i/7rF79eVtW4fGDQVvqGY1W1cRRbVY1tsRKrqi0PDNtquWxV1a188Nfly2WB7sw+cMNrtfqvYkCiAQrHk/7Bs59a/YvWJ2cuPPNsipu76d7fTT5d4Yqpb3an7ZtAedc+9eaNQVtCNXjinzyXF1o2unu/e0ew//c78Sqha6J2X47U/gB/AEzsiD0Fz8OLA4JCPTVdYxjVMdubuXH8mAvWN3Y1bBtwg+DANx4/cp9d/qsZa0+9c93P46i/4OEJ4nm6u/1+yT+znvqLT6D1ipPo+Pwyqht3kjl2GmNveCvp5jp3/Tv+l8nck++/4fw7D5OHpP+1oPgX1aGddn8JS2KdptMe2/yd25/k+doUwZYjmbVpM1vO/I9g+Ql3XfgVe+hzFRMf1ahS4ynWYWtCk770KJhT77qf2eJeePAJf1ffXjNYGKZkIwgNkvIQz0OdUi6XKfUPU+gepLK/hOTjyjhGbTqWuY+9qeXKn3JJy65Pfe/i7RMXn5D7UPs/2nJHL+mJzdL5uZ8RPbSBsYsvovMD/8YBv8iEcBRj5hzOlhXPkvv6RYz/wJm66rePu389c0lwW82X35rOH3//a72U/+c1oN2ILIn36APn3Lz52o+VfEYdERx+4G3Nn/2S7JH1Ok4fe27XwsdfDDp1ytmnor37VKyAZ/AKsVZ+u0V0e61pzaTNWSefB9nQEvqKMQrJH+4gAgCeakVK7C8ckI37t4Tr1r1w1APLnzrqrk33ffJN31uwcT+96ZMPm6TkQayDyGl+Xacckqkn/WIfE6cerpnO3XLIlClqIqG+vlEqXYMATJs+Xb2WjP6+Z83xCPev0Jde2Xj/z6G/yKV2T/jAOT9OPfjI0d94M1Ozh/LEF+7kxs7331cvucN+ue+b79vv93H0/ONgV6xiFUEhUmgIMa1ZiBxRtYDTPLrfClUnRArWgREIPcQ34HuA4qswoSbDhPQJ7pyzztDq5ZF7ovP3/oM/Wjbj6V+96C6timItGjuIlNyJUzlww69pKKZUnOWQ0ePV9pVQ35Oe3m4mnjYLBspkM1mCplD6evrbEFihK/iLAniJS1Wdyj/71y2Z87ZjOD1zcpkfbfaO0jHeer+7OuA//oVz8ldeecW73mXHF5u9yoZN6tWEog1pYWwOGZ1JFliI0KrDGJJF1gbgeyqTa4XptZDzQQRihXKMDkTE9SG2Ky+6ard46605o+VIzvj2+XH2+g+blb98jPPfcYloJVbbm2fMFQtYv/T3dL3cKW3jJ6ktRXhG2Lh2NXXXn0nD3Mnq+opUQktlsKw1ZIdQgIXAyldc0h+h/xJwLMQbSpfGNZuM8vnH/U0bn/Du7Vslp1bmjH1z/v1LLrz0EnflvMulWhrCm1AnHDda5KQxMKk28R+xg4yP1AZIXUqpSyvpUKUpA2e1waE1QlMg1HtCsy86NiPMrhPqAzw/xL90MvL2SRSDPG7pRnnv3EX89ue/YtOqNWRaRxMPFPGMpzPu/hC7DonYs227lAcKsnbzasl8/iwO/dRbtdI1gMlm2PTSBqnsz8vRNbOfRZPl/0UvsJRF3mXyH/Z+76vt6xq2Lo6anPP3exoMqvwmt9q8Z9F77GVugVTSBbyJ9RACFYfmI6jxIRdA6CU2HjsEUfUEfAMCMjmXaEBzCGkjGEn8DkCkysYCHFmbzG1PSe2KfZrahfzo2Z9x15qlfO37NzNvyiytDA4RNOawkZXNH7qDasd+Jn75ckadNVer+wdwsSU9pU0/9LZ3mdaHzED7GXcdLr+RPkV5I15AAvE1r4/N7vQOfPxn9qF3PTVjm9z45us5cvcoqTCM15hG+yvIYAUOr4c5zejqXthfhsYU0pRBcyl9JazyJTEN68AzUO8Lo0KkOQXZJJHRrhL0VTFzGmFyDt1dRDvzsKafoBhy4uJzufrLH+W977gaKhUFcDYmwoqrxoQNNUR9BU1nMjCpWW+76Rv26esfTn0r97nrmvJn3LqUpd6lr8lT/L/gAr0luiQuNsXzv9R389vC80bLPSfeSvahPVIyu/HrMuiOIURQRtcgHztKOCSN7i1DZ0EZiqAQI3Vloa1W8Q1UFUUT1BeH9FVV+yqoDicCGfEIkjLo73rQF/oFp9hKTFoyfO3uL3P6ey7gvZ/4CNXtXax85ndSX1vP/HnzSaXqLAhEFm90mq6+fXrLR78Udty+zv9I5qqvNhXOuPVUTvUX8ZL7q4HQctr901gS765/6BOfHvzKN6e8Z74umf0Pzt7xrMQTM3gnHoI+3qVUXPILgYhMrUcV2F9WApPs9ojKk/JF2nJK1n81xlQQSUISVJFMACePEn26RynEyRdqfJHT2nBrevGe6uNtP7yWKVceixcJm1etpzpQZtfuncybd4zMOGqmNI1uolqJ2L9tH3t+t51x/U1dn6m97jM1qZN/TbG/NSyPfiFyEX8xEDqoIjrqhUve3fPhZWPfNSv6yllLTPmrK8U7cyzmhrnQkkZ/sgO9c6tSiJBxOaEli27pU2pTI4sXCDwIPEQENYLUBZD2R0RgFOsSsESQwKBNoRCposl7RFbkwgkwpx5zRwfbfvIkD6/9DQ1DIXPrpnHkF9/OJ359A9EDe+1Mpq3YQWdDhpRto3XnaRz3uxlHvmNZ55aHFt5dvu/OLulNnabHPHbxxOuvlA7paqfdLGGJkz8KfliiOlnHf2bHZS9sP/ZA3bJ/WuYqn1lpzDEtmG+fKPiKGg95qV/1o88oViHtQyZArUMCUfU8ITCJADwSV3cQ5wTAKB6SPJfERQYHtcVLzAHAOUj7yNnjhDE5/Du3wgELLxdgfQ/88zy6mobtxxdd63/T/eMHDs+/7Q6jhmHNJ/fyhSXVd23KvXfitDOuuKB6+ye/GR7z/NTnrzzrxlMWP7q4tJjFr8/WZtFq7pPNbk4xfcc93oPzvve9H8QN93Z78WAe/5aTE9CKHVJ26NfWwd4CGhheQXHPgC/J4kMPPEnWLCP/jIy8SDYdMYgYxRjwRoKig19WTa6tWJVN/VAViasRcSu4d4/D7h4mPrmehiMm0bFni/fLpx458okfvHjb9fd9TrVNMwuHR33y7fbUs+u8hgkDqd4xF4dncOw586r//uLPx9es6cu9x/zjw7N0lmder/rLbDS5NP+eykOXvOmqi+KJpXFeacU2/A9Mh7YsFKyigbpbNqmu7lYNTJLJ+UYIPCF1cNfllexOFE0Wz4jrESUwooEHIuq8V9/WEQGpgCZXqgNitdhnOpXtvep1FNXz05gvzkWW7YFVB8x5510QH0gNTspfu+JkDPbXPTddvXbajq+semf3DUOmNDfztKd3P3SL1/J8TXD+W8+If2lWflCbdeqlXGpfEwgtA+CBjpuu2586wNWXXe3csg14bVk4fhy6M0b7A9xPO+D+l1XCBLU1NEJoICUJ+IWC+gmwJUA3IgwEVX1d2qseiEkeI+yDqDpEVcHh1JHyA9LpHKmaHGGYgv4i9vvrlecGMJNqiT7/LDP0EFc3exT3V359os7VIBMHbdV0JfrCeZ8pdp3d77XK6MGNL3WVd2xZbc6TY2xweDp4rOfmy5DEQlFUjuBSpxdq7Xc3fvXm0WdPyl1ywqWU73hevKNaYep4ZNDAriJy51qlGCGBB6EnhB4aGCQwr+78iIaDghl5mlAfctD2RZJoBDMCxgZBBPEQJ06MCKmaHHv7d8uaHWvY2bVTSsVhak2GdJAi7uiFtqzYsuK7NE+lXpJwbaXlKV1+zf50/+n25XKqb9v64N2zL+Cujod07sCs3S/oupbjGo53HdJptr3caX5n1t01EgcsM4DlmXXHd7Bn9PvPXRSzqttIJVJyKZEDRbQcw4MbkANFZCR5wYgSiEhgFE/AS+yWEQXAKBjzqqsZEZCKgkk4PhVQA0LinlUFz/dRI3LzI7fI/372YfKVIhUqzJp6hJx94hlM31rPCdPma3Vjt8qCscKU0aZ1uEW3sXr2nOnzGDt/LE/f8qxb37Gb8ydU3ZTW1mzc7fI9B4ZL7NuXmiKjZLvZNaXUXM4ZgBUk6eEjPY+dbNPCMVPmOtZ1YYJkO2VXL95965EtfapOUVXBiIiMpLIjzLwacJ4igRBmfMJUKCY0WGNFfQWTsIOJsAQCkEBGrlcQCzh833Djsm/Ivz3xU/Uio01hvdZ4GR0zdhzzrjmH2/Y/wpPbV0mogdjuATilllxDTtJSUzzwbFdhzu8zblRjTqNB2LZnK7OklSEpZMJKOj/Q12OaKmkiL87SQ60BOI0laoxhk24/qnZiE21Rk0QH8kjo4XUOU733BfKrdmIrkSQarYoBAiAUJQDnO8KaNOm6WlFfZV+5R/YW92NNLOmGOryUh/MVGdEUAkU9J/gOPId6DmssYTbDz5/6hTy5/gnG0ijWlahUixgr/HblI/qpBVdp2ve56fG7GYryBN0l6LSMPXwSAzqA79K6d9du9UqxSZGRod5BMnmP2ESgxFGhQjxYwdewDBQPhsI2J1n2sn/C6DGt0IfYaqRBEEj/rr1UTm6l5oQjGL57A9ndRUlla9X5KOnE7p0HqVyOzbu3yANbH2dV50YODPepU2V0bSNnzThR3nH8BWQzaSpxhDGvYIUiCY+gquIbw3D+AMufeowmUhxx6BGcNPsEaco16NDwIKt3rpflG59h85pVqnis271JTpp6DPbZXRx97PF6e/pr2RPjOnfP0BozqTypaP3BeHyxvmaFbNG0y1UPaClTX07ps8XtZG16V06yg/7BsHDw88Ppa5a8qfmQuqlQUIznUyz1a3FcTsa/dQGYmOr8KsNsJlV0ScDig/OVVC7L0tUPysr8Zl7cuF4LpWFyXhZ1yu7ebm7/3b265uX1suRtH6MxV0fVRZgRyvEgYFhnyYZZBnu6qAwOcNUZV3DeqW9KbKMSgYNTjzxFFx1zjvzvZx+R7Xt2MKa1DVxM5dlORh23gFOuOceu/vZa+2k+0U61uubb4Q9+1VEzzHPde1kgp5QLpqMudI2VNfmO9HSOXFHQ0mv4gN+QKRNlsn4GEDGZkCGtSN3eKtFHH6Z82X1Ib4FgYgNOHaQMzjhSuVq+/+iP5Qmvk2/95k6mj5siHlC0RZzGZPFoISfr97zILfffjgKZdIZUKkXgeQTGI5XJkG1oAhG8dIrPX3MD5516LtVyRcvDQ1SqRcrxMOWBvUyY0MbHTrmQb77veib7KeKmgMAYop88x0c/8jktHC/Bv/R/982HnH722kPjcQ/8tGtN5VzO+vo2fXmwrr7W/JKngqE88aLg0z/8o2xQQXzfh74iVCKJXJVKdy9hwanfUIOt98T7/QBSm8HiSKVrWL9tLSvZzuzWo3j3nPPYtHMzE3Jj5ILZC5gzbhqZMKVDpQLrt69nw7b19A0doLcyTJhK0ZJtINaY/Qf6Wbt7A8tfeprt3Tu4/oKPMHbMRNXIqqcIKR/d1yWYMpV8GaJhDJbqvj2Yhgxy1KG47YNwzzZz01132mvfsuikGx9978rPn/DDU3matCem8/Hw9g8/0PfY2Vt1UK/2L/6IVGTrUpZ6rwqgidhD4jiKYF2P2h19NKTqpNPtgGyzmFrF/HoTdbU5VV+StNb4/KZjtezcvI2eDbvoiru5bOa5XHvyJTQ1j07iOAF8X0+cPl/KUcwvN/yW9oe+Q0vYSF0mp1UXUSoWUFthjF9LTRzLvU/+nDMPPxGsJjfKD4v09cCxk+HlbmT+FHTFRmTGWHT9ZmThdLzT5xDf9By5h/vNt5fdXb38tPOmf2f1x+//tHfriafYBf4plfff7ILtj2NaKlKp29ROu3l9JPgFyiFhYbh/EIoR/fu6qDVZndg6gWJQwVlLrZ9RDZIYQABcTPdgH5VKnkDhS6d/iOvPez8NmQzloV4q5QKVUpFKfphSuaTpmgy/3fwsY6jRSV5Wc8USE2KPeTWjOLpxooyqqWVctpFqsUB/YUACZ1QVobtfaG1Cd/UjzXXo+l1INgs9/ZCtRzf0437fhfeWqZSDiOaXU/6S73+j8kD0qxMeT91x/UpWxl9ggS/R5Bekmix+yUid0B/Ji6X+uFz0Ps4d6B3qB8paKRakUi2SC7LUXzILt6kXOzicZGixQmwgjrl45gLa6up505ELmNrQSkWHYF8XXpgWRrcpZQfiYXyDrZQ0rpZltJ9lTLpe5mbGMtarVc94Ui2V2W0H5XndRwVH7GKMgpSqKrlmNEBEK2ADpD8PDc0wNAB+LWzsh+ZauPQQ/KPrKX9nA8dfstCf8ab57gcP//STerLeLr+TnuUs9xeywr22SHrQBExBy7aFhq51/TuJg6IqisaWSlgl/9QWwpKlJptOyIvJzZhymahYYP7EGTp/3KFCnUd51068SaPRuIIcPg4txTDCbWhk8Xyf+iBLfapBFjXOobWhmcyoOvx0iGupZ/quHkatfY6H/H2k1cdWIqHiVK1CBRUvBUUHqdEw4MA0o8MRDBREfAOxCjmDTGtUfrFDrrz26vhTD1/btG7tvRcDt8EK/rBCbBL661SxztJGS8dA/yA9A92vJC+h+hoMlQnFS5K2XAodlUtyWxGq/d1S7t9NZbAHb1ILDBWQcS1Qm0bsSA2gYtFyBJFhSssEjsuMZ+LY8TQfO4W66WMlO7aZ2oWzaL74JA5rHc+M5olkTRpbjhLCJLZKxaIFiw4p9Fl0wMJAhJQVhqqqT+xFd8cIBq8pQ/zkLubUHi65sY36q/zj53nicQtL9E9Valk4QhQfZiZsckXLzt7d+EGAGIOLLXVnzSFsyKGhjw5F8Nxe5UBRJXJIXz9etgbJVyBIQ38ZqamHrhJaiKEcQzVGqg6KFU6eNJ90fT1Nh43DhJ7ayGJFsU+8pGZth/qTRnPYIYfhxUY1GmGMYoVIoOKgatGyRSqKVhxasUks8fxe1SWr1X3/ZdXle7Fbe9V72cqkI6fKdnbOju+Nw2Vg/7A67CcCmKUA84LDtwaRz46+TpnefCxepNi2GjEzRuE278fMnSzMbELXdcPOLtXSIFig4COkkGqotI1Fe2OhbJPPHGAdokKULzKtboJ2TeyUvC1qxtZgxSkiaCCAsNcWmD76cBguIZGikYo4wCmMaJRYTZioWIU4TkpyIsJTncoTnQk7NZCHl4dlzOhDeIEdbSymDeiExa/h4F9JXhcpQI03db/Bp1uHvfoJh4gOlYXROXTvEGb+ZORzc5BrJoicfxg0NgnVQNBmZMioDGdV1w8LQwrWKVWnFB2UFSIg0mTn8hHzDjlCO/sGRCKL7wTfQkrSdHbvEWOyjDGNVIfKUI6RKFaqFo1icFZxTtU51DlEnY7warhqRDQxK/GcBqlSQTDCrmFpTNW7KnGGIeqStS7mjzTglRFmnRZjmFiPaa5X91IHsn9QyNQh/zgPWq3Q61S3FRIeb8iBjVVFEwbYeOhgLDIuo9T6KDFSsop7lReMi5aGVEZMdiJdvQckmzHqROnOD8lwEea0HKHxUAWJnR7ccXWoGBlJw4wkngjUKqKqLrYMpWKpv/poTFstvd9YKf7eTlIDFtM8wr9Uq3+yO8RPuKCRnj/pr42JaJ031dFVMlVb0bCzH+bNgCkpwKKrS+iTe9CtnUh/ScUoKgYRB8YqnkGHrNAawqgQ6gK06qDk0FgRFapRlVyY0ZTXJoNDg1KwJWpNK9PrRmk8FCU8mIpgjIpvEo11RlQFwaFWEneckEiUbEW8vMIXVxE7pX5mPT0zamnqq2qpvmJCQocXVv+sBiwaebG7vH20ApPGHqrVtQcoRxXxi1U0UtQigsBQDFv3Knv7E07fGBCbPEfAd4kmbM0ju31oDkVqfSVMNAQFsYotRngi2uI3S6uX0EJRIUp+z5ek9TJCtKoJ8FUi0ciBVcSIiicQRXhVEVVH1DVIodirBkv2+AVSU6mHvip9+QHJkc1TzyD7ABYrLHm9AA4SInsru0YRCKOyjTo0uJUBr0xNoURlQyc1q6epOy0Q0gYNAtHqCHgZTXg/kYTVxYCirqpIMYLeWCQUkayPZAyaMkjCGKuKwWI1dg4xgjoViU2y4HyMKzi1pSgBU5uEJuqsqIw0F8xuknhSDreil/3eMGNStZI2WQrdvURPdsDCObpv/z5aaNjPxznANX9cCnkdBlRcJSAQPN+jEpU5YMuaCUrSsnYH5bvWkRqcphoo5vA2NF+AvmGILToCqy62xKUqrmjx/BDPD1BnoAqULRLEmECU0CCBjJCigjgRtQqxU1clcW9Vh6qMZMyShCUJUa7iVPLVAj7NNIwZQzG7m+CAsj3VTY1fS+43w+TKlmKb0T3P7WE+J2zyrvWiRQkPZf+sABqC+jyRI5+OaUjXUDNcIx1awlarjLnvGVyNj9w2R2SKp/Zt26V6IE8cOrU2xjqHOIM4wYiPjR1iqnjiqREPYw1SFfCMiKeIn4CieKIHGyTUGSF26pTEFNxIJ4l1OOvEOZeEZ2rxQp/OZ5+jb/Vm6qhhnGuhVot41mEwxPVpttX1aXHvMCf68x93seM62mXZa9T/j+KA2XVzOvxe4eXyfjNrXIv6B7pkOhfRy2422qc59M4K9Tt71JtYi3/8IXinH0L+jmcEXwicUSMenvEwMkKEqiNysVRRIiwVYqpYYhxWk9jAF098PDISkPVSpP20eJ4HnlGb9ISi1iWgZyM0tgKQIpTx/gRcW4a6caOJOwdo3GsIGiaSL4Y0Hp3i+1vu9cfblviIMZc9wL53sJDFjj8lAFiUQOr4o9Y199YPPbN1Vd1FC6+1mefXkZJaZsYXsxHDk/5yGn6zixbS1E6bgNeSRbwIh2DFiaVCVS0ljShKRJGIAlWqWBIcdaKYpFAiiknyMJwqPkI6DsnFgTSTpc00SJ2Xw3geTlQR8GtrxJvdhpnZhEyqoeaIRsxJo6DBJ164nLiQhVvPpXbJNgZmddtHf7Q8+KC55LGwK9jUTrsRxP1JNyiIttNugheCnu/Jx5+867cPnzt86z+4tgcme0Pbnqc2O5EZcgqmELMheJK9MkB2s9WWzZOk2/RqkWEEg8UllDeAGg7qgiHAx0iYVD8SylzAYVVAnIDDURJHXovaRUG3uj7TYjNMlGZavToJYsE/ZyrBXSdB/cjsS+DW5yl990UOrHyO+rpTSH12D5njHF958Q4mD7RyecN1//TOgcXMYpb8xV7hg61j2rr9rEu6L//19PcdX73x9Ha/+5ofEdrjqDv+eOyOHjo7VtDJKnL+oRzD+9ntnmEV9yh4pMUnEF8EH0YAzL7uNiMCOHjsABUQTSIUJwcBz6nDiiXWCMXSLAFjtYGG+laCI8ZhmmuIixWKHd0MbtpOkTytLWcziumkZxX5Wesvqjct+176W+Fnf3Bc9X1X38u9r2uK+LP9AUq7CeRG92D6G3d/ofStKz7x1RvKb2+9KCzc+Bian0Xqa7ORoQpdSx5l38BaUqYVq8oAL9OoIVkNRgrfgjMekSqxuiSgQ4lRrHhJCUSSUoi+GpYj6tTTUHLUkSZNWjL4pIjV0M9OSuzFECFYHDGGFI25mYwbdw65tvEw8WW9s//H8Xd/8cPUp4OrVy1q+dzCxfsWlxezWN9Qt/jBdnSdr+l71n3x4Zurdy044z1vif5hwTVat6LsUcoIl7Xhlis9N/+SAbajWGpI4QU+mfoc6WwdYa4Jb2AYhoYVzwfPU8RqKS5p3pYpuioVF1NRh5IYiY+QCjLUp+oIyYrECLERE/uIyUgpHKQo/agHgZ+mZsYUai8+StmcU3q79Wn3K731xR+HXZu6+Ejw7sff3PzJS6RLev5al7j8mbZ01SO15slNt3/nluqP3tvbUmTuScdySu0sO2t4oh0dNpEeFoiipMEpikb6AFStKIPVCvv7d0lnqcvvrPZIV6WfwahIsVymGkdJ3VQ14RckSc48EYIwJB2G5MIMOS9NfVhDY1hLa6bJNte0aE0qpyaVokpA/xiVnZUOf8Om59m0byv5fSWO0sP2fTj77n8dfcw5X5OVEr+RFnn5C735ioC2DJ18X8+337+SVafvoX+crXOk0z65TA0pPyClHmqVKIooVatUogpROcbFhlBDm3O5nhbqdzdR/3IDdfvqTG1fzmTzIUHJx9eYyJSIUmUt1w3YoYZhii3DFFoHGW4rSKGlQKnBGpdxYpPSmiQ1BC+CNKlyE817ZjJ1zYWp0x8ZdeiZP5dN0vvXDkm8wWbpV09nIKAXaC1P7DnixcGVs7a4jsO66R2bZ7ilShQqRtOE5Rpq+pup3zvejO6Y4R+6szE8cwdt7KnbnhsapjhSMf3rMwoJqJEMfYcN1tJNI5U9zWW7vbE3HsoVqYa15CptmYl9NE/bw1XslS9K9SCULGWpt4hF7o0e4pI3cmhiGctYxjL7h1f54uONUApWLfHBKPOPby2LwMzkVFn4ujbF148VrGADrbqMZQc7id/o8JbTLgtZbP/W02vyt5zaWMYyM4qXZAWwgQ0HJ/qaRS5iJjNl4SvR5X/tSF1CXy2WJIVNUvYVvCQLmaXLgEW8pPwFhP/7+Pv4+/j7+Gvj/wBI2FQ0Uxi6uwAAAABJRU5ErkJggg==';

	/** Default user options. The live values are in `opts`, saved in localStorage under KEY. */
	const DEFAULTS = {
		/** @type {{ x: number, y: number } | null} Toggle button position as window fractions; null puts it bottom right. */
		pos: null,
		/** @type {{ x: number, y: number, w: number, h: number } | null} The window's place and size in px once moved or resized; null keeps it by the slime at its usual size. */
		win: null,
		/** Seconds between beeps when a WaveBeep goes to several friends. */
		gap: 1.5,
		/** Whether 📍 (a join button for your room) starts switched on in a chat. */
		shareRoom: false,
		/** Whether WaveBeep keeps the ticked friends (`picked`) for next time. */
		remember: true,
		/** @type {number[]} Member numbers ticked in WaveBeep. */
		picked: [],
		/** Chime for new messages. */
		sound: true,
		/** A card by the toggle for each new message. */
		popups: true,
		/** Group chats notify you of every message by default; otherwise only of @mentions and replies to you. */
		groupAll: false,
		/** No sound or card while SlimeBeep is open in front of you (new messages show in it). */
		quietOpen: true,
		/** A system notification for new messages while the game tab is hidden. */
		desktop: false,
		/** Save chat history per account (see `hist`). */
		keep: true,
		/** @type {string[] | null} Ids of news.json items already shown as cards (null before the first load). */
		seenNews: null,
		/** @type {string | null} Last version that posted its update note in the room chat. */
		lastVersion: null,
		/** After an update, a note in the room chat with what's new. */
		updateNotes: true,
		/** Night colours. */
		night: false,
		/** @type {'all' | 'others' | 'none'} Whom the slime and version show over in a chat room: everyone, all but you, nobody. */
		badges: 'all',
		/** Follow a theme add-on's colours (Themed, BCNeko). */
		themed: false,
		/** @type {string[]} Emoji for the picker's 🕘 tab, newest first. */
		recentEmoji: [],
		/** @type {Record<string, 'all' | 'mention' | 'none'>} Chat -> what notifies you from it (unset: chatLevel's default). */
		notify: {},
		/** @type {string[]} Chats made quiet before `notify` existed: 'n:<member number>' or 'g:<group id>'. */
		muted: [],
		/** @type {string[]} Chats kept at the top of 💬 Chats and 👥 Groups: 'n:<member number>' or 'g:<group id>'. */
		pinned: [],
		/** Do not disturb: no sounds, message cards or desktop notifications (messages still arrive, unread). */
		dnd: false,
		/** @type {string[]} Sites besides EMBED_HOSTS whose pictures show in chats without asking. */
		trustedHosts: [],
		/** Music player volume, 0 to 100. */
		musicVolume: 70,
		/** Whether the music player is muted. */
		musicMuted: false,
		/** @type {{ x: number, y: number } | null} Where the music player was dragged to, in px; null for bottom left. */
		musicPos: null,
		/** Version and missing game parts already warned about by gameCheck. */
		gameWarned: '',
		/** AFK: beeps and whispers get an automatic reply (afkMsg), once per person every AFK_GAP. Not part of your status. */
		afk: false,
		/** The AFK auto-reply. */
		afkMsg: "I'm away right now, I'll answer when I'm back!",
		/** In the same chat room, a chat's replies whisper (otherwise they beep). */
		roomWhisper: true,
		/** Whether to warn when SlimeBeep's server can't be reached (off once its card was clicked). */
		relayWarn: true,
		/** Your status: a short line of your own (like "king of the swamp") that SlimeBeep friends and your groups see. */
		status: '',
		/** Whether your status also says what you listen to in the music player. */
		showListening: true,
		/** Language messages are translated into; '' follows CATS, then the game's language. */
		translateTo: '',
		/** @type {string[]} Chats that translate others' messages by themselves: 'n:<member number>' or 'g:<group id>'. */
		autoTranslate: [],
		/** @type {Record<string, string>} Chat key -> the language 🌐 by the send button translates your message into. */
		writeIn: {},
	};
	/** @typedef {typeof DEFAULTS} Options */
	/** Release notes, shown as cards and in update notes. */
	const NEWS = 'https://proudkiller0015.github.io/slimebeep/news.json';
	/** Most entries kept in `hist`. */
	const KEEP_MAX = 2000;
	/** localStorage key of `opts` (shared by every account in this browser). */
	const KEY = 'slimebeep.options';
	/** @type {Options} The live options. */
	const opts = (() => {
		try {
			return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
		} catch (e) {
			return { ...DEFAULTS };
		}
	})();
	const saveOpts = () => {
		try {
			localStorage.setItem(KEY, JSON.stringify(opts));
		} catch (e) {
			/* private window: options last this visit */
		}
	};

	/**
	 * An online friend, as the server's OnlineFriends answer lists them.
	 * @typedef {object} Friend
	 * @property {number} MemberNumber
	 * @property {string} MemberName
	 * @property {string} [ChatRoomName] the room they are in
	 * @property {string} [ChatRoomSpace]
	 * @property {number} [ChatRoomMemberCount]
	 * @property {number} [ChatRoomLimit]
	 * @property {boolean} [Private] in a private room
	 * @property {string} [Type] 'Friend', 'Lover', 'Submissive'...
	 */
	/** @type {Friend[]} Online friends, from the last OnlineFriends answer. */
	let friends = [];
	/** Open panel tab: 'chats', 'groups', 'friends', 'wave', 'bug', 'newgc' or 'invitefor'. */
	let tab = 'chats';
	/** @type {number | string | null} Open chat: a member number, 'g:<group id>', or null for the lists. */
	let thread = null;
	/** Search box text on the list tabs. */
	let search = '';
	/** True while a WaveBeep is going out. */
	let sending = false;

	/**
	 * A message in a chat (an entry of `hist`).
	 * @typedef {object} HistEntry
	 * @property {string} k unique key: the game beep's (keyOf), 'g:<group>:<id>', 'raw:...', 'mail:<id>' or 'w:...' (a whisper)
	 * @property {number} MemberNumber one-to-one: the other person; group: the sender (0 for system lines)
	 * @property {string} MemberName
	 * @property {boolean} Sent sent by you
	 * @property {number} Time when, in ms
	 * @property {string} [Message] a beep's message, as the game keeps it (may carry settings after MARK)
	 * @property {string} [ChatRoomName] the room a beep was sent from
	 * @property {string} [group] the group id, for group messages
	 * @property {string} [text] a group message's text
	 * @property {string} [sys] a group's system line: 'roster' or 'left'
	 * @property {boolean} [unread] for entries the game's log doesn't have (group, caught and mailbox ones)
	 * @property {boolean} [mail] went through a mailbox
	 * @property {boolean} [whisper] a whisper in a chat room, not a beep
	 * @property {boolean} [unchecked] mailbox beep whose sender key could not be checked
	 * @property {string} [announceText] the card text, when different from the message
	 */
	/**
	 * Every message shown in chats: beeps copied from the game's FriendListBeepLog (emptied at each
	 * login), group messages and mailbox beeps, oldest first. Saved per account under histKey() when
	 * opts.keep is on.
	 * @type {HistEntry[]}
	 */
	let hist = [];
	/** @type {number | null} Member number `hist` was loaded for. */
	let histOwner = null;
	/** @type {Set<string>} Keys of the entries in `hist`. */
	const histKeys = new Set();
	/** @type {Map<string, BcBeepLogEntry>} Key -> the game's own beep, so opening a chat can set its Read flag. */
	const live = new Map();
	const histKey = () => `slimebeep.history.${Player.MemberNumber}`;
	/**
	 * Keys of messages you deleted that the game's log, the relay or a mailbox could hand over again, so they
	 * stay deleted. Saved per account under deletedKey(), the newest DELETED_MAX.
	 * @type {Set<string>}
	 */
	const deletedKeys = new Set();
	const deletedKey = () => `slimebeep.deleted.${Player.MemberNumber}`;
	/** Most keys kept in `deletedKeys`. */
	const DELETED_MAX = 2000;

	/** BeepType of the hidden beeps SlimeBeep friends exchange (see onHidden). */
	const PROTO = 'SlimeBeep';
	/** The relay (group chats and mailboxes). */
	const RELAY = 'wss://slimebeep-relay.slimebeep-relay.workers.dev';
	/** RELAY, or a local relay set in localStorage 'slimebeep.relay' (the tests use this). */
	const relayUrl = () => {
		try {
			const local = localStorage.getItem('slimebeep.relay');
			return local && /^ws:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(local) ? local : RELAY;
		} catch (e) {
			return RELAY;
		}
	};
	/** Limits (the first four match the relay's). */
	const LIMITS = {
		/** Longest group or member name. */
		name: 40,
		/** Longest group message. */
		text: 500,
		/** Most members in a group. */
		members: 40,
		/** Most admins in a group. */
		admins: 10,
		/** Most groups you can be in. */
		groups: 30,
		/** Hidden beeps accepted from one friend per minute. */
		perMinute: 60,
	};
	/**
	 * A member of a group, as the relay's roster lists them.
	 * @typedef {object} GroupMember
	 * @property {number} n member number
	 * @property {string} name
	 * @property {string} kf the first 16 chars of the key they signed in with
	 * @property {{ x: string, y: string }} [pub] the key they signed in with
	 * @property {string} [ek] their encryption public key ("x.y")
	 * @property {string} [eks] `ek` signed with `pub`, so the relay can't swap it
	 * @property {Handover} [rk] how the key they had before handed over to `pub` (see followKey)
	 */
	/**
	 * A group chat you are in.
	 * @typedef {object} Group
	 * @property {string} id
	 * @property {string} name
	 * @property {number} owner member number
	 * @property {number[]} admins member numbers (the owner included)
	 * @property {boolean} open anyone in it can invite
	 * @property {GroupMember[]} members
	 * @property {number[]} [online] members connected right now
	 * @property {number} last id of the newest message received
	 * @property {string} [picv] version of your picture already sent to it
	 * @property {string} [pic] the group's picture (a data URL)
	 */
	/** @type {Record<string, Group>} Groups you are in, by id. */
	let groups = {};
	/** @type {Set<number>} Friends known to have SlimeBeep. */
	let peers = new Set();
	/** @type {Record<number, string>} Friend -> first 16 chars of their public key, as their own SlimeBeep sent it. */
	let peerKeys = {};
	/** @type {Record<number, string>} Friend -> their encryption public key ("x.y"), as their own SlimeBeep sent it. */
	let peerEks = {};
	/** @type {Record<number, string>} Friend -> the key start they had before moving to new keys (followKey); their mailbox beeps signed with it still count. */
	let peerWas = {};
	/**
	 * A group invite from a friend, not joined yet.
	 * @typedef {object} Invitation
	 * @property {string} code SB-<group id>-<secret>
	 * @property {string} name the group's name
	 * @property {number} from who invited you
	 * @property {string} fromName
	 * @property {number} at when, in ms
	 */
	/** @type {Invitation[]} Group invites from friends, not joined yet. */
	let invitations = [];
	const gcKey = () => `slimebeep.gc2.${Player.MemberNumber}`;
	/**
	 * A beep to an offline friend, not delivered yet.
	 * @typedef {object} WaitingBeep
	 * @property {string} id
	 * @property {number} n the friend's member number
	 * @property {string} text
	 * @property {number} at when it was written, in ms
	 * @property {number} [tried] last mailbox attempt, in ms (not saved)
	 */
	/**
	 * Beeps to offline friends not delivered yet, saved per account. mailWaiting leaves them in the
	 * friend's mailbox; otherwise sendWaiting sends them when the friend is online.
	 * @type {WaitingBeep[]}
	 */
	let waiting = [];
	/** Whether an OnlineFriends answer has arrived, so `friends` can be trusted. */
	let friendsKnown = false;
	const waitKey = () => `slimebeep.waiting.${Player.MemberNumber}`;
	const saveWaiting = () => {
		try {
			localStorage.setItem(waitKey(), JSON.stringify(waiting));
		} catch (e) {
			/* this visit only */
		}
	};
	/** A group invite code: SB-<group id>-<invite secret>. */
	const CODE_RE = /^SB-([a-z0-9]{8,24})-([A-Z2-9]{10})$/;
	/** An encryption (ECDH P-256) public key: x.y in base64url. */
	const EK_RE = /^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/;
	/**
	 * Whether `x` is an id made by newId (also group ids).
	 * @param {unknown} x
	 * @returns {x is string}
	 */
	const isId = (x) => typeof x === 'string' && /^[a-z0-9]{8,24}$/.test(x);
	/**
	 * Whether `n` is a plausible member number.
	 * @param {unknown} n
	 * @returns {n is number}
	 */
	const isNum = (n) => Number.isInteger(n) && /** @type {number} */ (n) > 0 && /** @type {number} */ (n) < 1e9;
	/** A random id (8-16 lowercase letters and digits). */
	const newId = () => {
		const a = new Uint32Array(3);
		crypto.getRandomValues(a);
		return [...a]
			.map((x) => x.toString(36))
			.join('')
			.slice(0, 16)
			.padEnd(8, '0');
	};
	/**
	 * Text from outside, made safe to keep: control characters removed, trimmed, cut to `max`.
	 * @param {unknown} x
	 * @param {number} max
	 * @returns {string} '' for anything but a string
	 */
	const clean = (x, max) =>
		typeof x === 'string'
			? x
					// eslint-disable-next-line no-control-regex -- removing control characters is the point
					.replace(/[\u0000-\u0008\u000b-\u001f\u007f\uf124]/g, '')
					.trim()
					.slice(0, max)
			: '';
	/**
	 * Whether a member is on your friend list. FriendNames only knows the friends whose names the game has
	 * seen (a beep, the online list), so FriendList (every friend's number) is checked first.
	 * @param {number} n
	 */
	const isFriend = (n) =>
		(Array.isArray(Player.FriendList) && Player.FriendList.includes(n)) ||
		!!(Player.FriendNames && typeof Player.FriendNames.has === 'function' && Player.FriendNames.has(n)) ||
		friends.some((f) => f.MemberNumber === n);
	/** Your name, as groups and mailboxes see it. */
	const myName = () => clean(Player.Nickname || Player.Name, LIMITS.name) || `#${Player.MemberNumber}`;
	/**
	 * @param {Group | undefined} g
	 * @param {number} n
	 */
	const isAdmin = (g, n) => !!g && g.admins.includes(n);
	/**
	 * @param {Group | undefined} g
	 * @param {number} n
	 */
	const isMember = (g, n) => !!g && g.members.some((m) => m.n === n);
	/**
	 * Whether member `n` may invite people to `g`.
	 * @param {Group} g
	 * @param {number} n
	 */
	const canInvite = (g, n) => isMember(g, n) && (g.open || isAdmin(g, n));
	/**
	 * A member's name as shown in a group ('You' for yourself).
	 * @param {Group | undefined} g
	 * @param {number} n
	 * @returns {string}
	 */
	const memberName = (g, n) => {
		if (n === Player.MemberNumber) {
			return 'You';
		}
		const m = g && g.members.find((x) => x.n === n);
		return (m && m.name) || nameOf(n);
	};

	/** Loads groups, peers, peer keys, invitations and waiting beeps for the logged-in account. */
	function loadGC() {
		for (const c of Object.values(conns)) {
			c.dead = true;
			try {
				if (c.ws) {
					c.ws.close();
				}
			} catch (e) {
				/* gone */
			}
		}
		for (const k of Object.keys(conns)) {
			delete conns[k];
		}
		groups = {};
		waiting = [];
		try {
			/** @type {unknown} */
			const w = JSON.parse(localStorage.getItem(waitKey()) || '[]');
			if (Array.isArray(w)) {
				waiting = /** @type {Partial<WaitingBeep>[]} */ (w)
					.filter((x) => x && isId(x.id) && isNum(x.n) && typeof x.text === 'string')
					.map((x) => ({ id: String(x.id), n: Number(x.n), text: String(x.text).slice(0, 1000), at: Number(x.at) || Date.now() }))
					.slice(0, 100);
			}
		} catch (e) {
			/* none */
		}
		peers = new Set();
		peerKeys = {};
		peerEks = {};
		peerWas = {};
		invitations = [];
		groupKeys = loadGroupKeys();
		keyCache.clear();
		// Your own picture is this account's (and takes over one an older version kept for every account).
		myPfp();
		relayPics = {};
		try {
			/** @type {{ groups?: Record<string, Partial<Group>>, peers?: unknown[], peerKeys?: Record<string, unknown>, peerEks?: Record<string, unknown>, peerWas?: Record<string, unknown>, invitations?: Partial<Invitation>[] }} */
			const saved = JSON.parse(localStorage.getItem(gcKey()) || '{}');
			for (const g of Object.values(saved.groups || {})) {
				if (!g || !isId(g.id) || !Array.isArray(g.members)) {
					continue;
				}
				groups[g.id] = {
					id: g.id,
					name: clean(g.name, LIMITS.name) || 'Group chat',
					owner: isNum(g.owner) ? g.owner : 0,
					admins: Array.isArray(g.admins) ? g.admins.filter(isNum) : [],
					open: g.open === true,
					members: g.members
						.filter((m) => m && isNum(m.n))
						.map((m) => ({
							n: m.n,
							name: clean(m.name, LIMITS.name),
							kf: typeof m.kf === 'string' ? m.kf.slice(0, 16) : '',
							...memberKeys(m),
						})),
					last: Number.isInteger(g.last) ? Number(g.last) : 0,
					picv: typeof g.picv === 'string' ? g.picv : undefined,
					pic: typeof g.pic === 'string' && g.pic.length <= PFP_MAX && PFP_RE.test(g.pic) ? g.pic : undefined,
				};
			}
			for (const n of saved.peers || []) {
				if (isNum(n)) {
					peers.add(n);
				}
			}
			for (const [k, v] of Object.entries(saved.peerKeys || {})) {
				if (isNum(Number(k)) && typeof v === 'string') {
					peerKeys[Number(k)] = v.slice(0, 16);
				}
			}
			for (const [k, v] of Object.entries(saved.peerEks || {})) {
				if (isNum(Number(k)) && typeof v === 'string' && EK_RE.test(v)) {
					peerEks[Number(k)] = v;
				}
			}
			for (const [k, v] of Object.entries(saved.peerWas || {})) {
				if (isNum(Number(k)) && typeof v === 'string') {
					peerWas[Number(k)] = v.slice(0, 16);
				}
			}
			for (const i of saved.invitations || []) {
				if (i && typeof i.code === 'string' && CODE_RE.test(i.code) && isNum(i.from)) {
					invitations.push({
						code: i.code,
						name: clean(i.name, LIMITS.name),
						from: i.from,
						fromName: clean(i.fromName, LIMITS.name),
						at: Number(i.at) || 0,
					});
				}
			}
			// Peers saved under the older storage key.
			/** @type {{ peers?: unknown[] }} */
			const old = JSON.parse(localStorage.getItem(`slimebeep.gc.${Player.MemberNumber}`) || '{}');
			for (const n of old.peers || []) {
				if (isNum(n)) {
					peers.add(n);
				}
			}
		} catch (e) {
			/* unreadable: start fresh */
		}
	}
	/** Saves groups, peers, peer keys, their encryption keys and invitations for the logged-in account. */
	function saveGC() {
		try {
			localStorage.setItem(
				gcKey(),
				JSON.stringify({ groups, peers: [...peers], peerKeys, peerEks, peerWas, invitations: invitations.slice(-20) }),
			);
		} catch (e) {
			/* the browser won't keep it */
		}
		saveBackup();
	}
	/**
	 * The `hist` key of a game beep: its Id, or its sender, time, direction and start of text.
	 * @param {BcBeepLogEntry} b
	 */
	const keyOf = (b) =>
		b.Id ? `id:${b.Id}` : `${b.MemberNumber}|${new Date(b.Time).getTime()}|${b.Sent ? 1 : 0}|${String(b.Message || '').slice(0, 40)}`;

	/**
	 * An element of SlimeBeep's own UI by id. build() and the render functions create them, so code that can
	 * run before they exist checks the result first.
	 * @param {string} id
	 * @returns {HTMLElement}
	 */
	const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id));
	/**
	 * An <input> or <textarea> of SlimeBeep's UI by id (value, checked, disabled).
	 * @param {string} id
	 * @returns {HTMLInputElement}
	 */
	const $input = (id) => /** @type {HTMLInputElement} */ (document.getElementById(id));

	/**
	 * Game globals SlimeBeep uses: [name, typeof check, what stops working without it]. Shown by the
	 * 🐞 report and a one-time card when missing; .github/workflows/bc-check.yml checks the live game daily.
	 */
	/** @type {[string, () => string, string][]} */
	const NEEDS = [
		['ServerSocket', () => typeof ServerSocket, 'everything (the connection to the game)'],
		['Player', () => typeof Player, 'everything (who you are)'],
		['ServerSend', () => typeof ServerSend, 'friend lists and beeps'],
		['FriendListBeepLog', () => typeof FriendListBeepLog, 'reading beeps'],
		['ServerSendBeepMessage', () => typeof ServerSendBeepMessage, 'sending beeps the usual way'],
		['ChatRoomSendLocal', () => typeof ChatRoomSendLocal, 'update notes in the room chat'],
		['ServerPlayerIsInChatRoom', () => typeof ServerPlayerIsInChatRoom, 'knowing you are in a room'],
		['PreferenceRegisterExtensionSetting', () => typeof PreferenceRegisterExtensionSetting, 'Settings > Extensions'],
		['DrawCheckbox', () => typeof DrawCheckbox, 'Settings > Extensions'],
		['MouseIn', () => typeof MouseIn, 'Settings > Extensions'],
	];
	/** The NEEDS entries the game doesn't have (any more). */
	const missing = () =>
		NEEDS.filter(([, t]) => {
			try {
				return t() === 'undefined';
			} catch (e) {
				return true;
			}
		});
	/** @type {string[]} The last 10 caught errors, for the 🐞 report. */
	const errors = [];
	/**
	 * Logs a caught error to the console and to `errors`.
	 * @param {unknown} e
	 * @param {string} [where] what was being done
	 */
	function warn(e, where = '') {
		try {
			const err = e instanceof Error ? e : null;
			const msg = `${where ? `${where}: ` : ''}${(err && err.message) || String(e)}`.slice(0, 200);
			const at =
				err && err.stack
					? String(err.stack)
							.split('\n')
							.find((l) => /slimebeep/i.test(l)) || ''
					: '';
			errors.push(`${new Date().toISOString().slice(11, 19)} ${msg}${at ? ` (${at.trim().slice(0, 120)})` : ''}`);
			if (errors.length > 10) {
				errors.shift();
			}
			console.warn('[SlimeBeep]', where, e);
		} catch (x) {
			/* ignore */
		}
	}
	/** @type {Record<string, string>} */
	const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	/**
	 * Text escaped for HTML (content and quoted attributes).
	 * @param {unknown} t
	 * @returns {string}
	 */
	const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
	/** HTML that can be inserted as is: built by `html`, or markup made from escaped text and marked with trustedHtml. */
	class SafeHtml {
		/** @param {string} value */
		constructor(value) {
			this.value = value;
		}
		toString() {
			return this.value;
		}
	}
	/**
	 * One value inserted into `html`: SafeHtml as is, arrays one after another, null/undefined/false as nothing, the rest escaped.
	 * @param {HtmlValue} v
	 * @returns {string}
	 */
	const htmlPart = (v) => {
		if (v instanceof SafeHtml) {
			return v.value;
		}
		if (Array.isArray(v)) {
			return v.map(htmlPart).join('');
		}
		if (v === null || v === undefined || v === false) {
			return '';
		}
		return esc(v);
	};
	/**
	 * Tag for HTML templates: every inserted value is escaped unless it is SafeHtml, so text can never become markup.
	 * @param {TemplateStringsArray} strings
	 * @param {...HtmlValue} values
	 * @returns {SafeHtml}
	 */
	const html = (strings, ...values) =>
		new SafeHtml(strings.reduce((out, s, i) => out + s + (i < values.length ? htmlPart(values[i]) : ''), ''));
	/**
	 * Marks markup assembled from already-escaped text as safe. Used only by rich().
	 * @param {string} s
	 */
	const trustedHtml = (s) => new SafeHtml(s);
	/**
	 * Puts HTML into one of SlimeBeep's elements. The only place that sets innerHTML: it takes SafeHtml
	 * only, so everything shown went through `html` (and its escaping) first.
	 * @param {Element} el
	 * @param {SafeHtml} content
	 */
	function setHtml(el, content) {
		// eslint-disable-next-line no-unsanitized/property -- content is SafeHtml, escaped by `html`
		el.innerHTML = content.value;
	}
	/**
	 * The HTML elements under `root` that match `selector`.
	 * @param {ParentNode} root
	 * @param {string} selector
	 * @returns {HTMLElement[]}
	 */
	const $$ = (root, selector) => /** @type {HTMLElement[]} */ ([...root.querySelectorAll(selector)]);
	/**
	 * The <input> elements under `root` that match `selector`.
	 * @param {ParentNode} root
	 * @param {string} selector
	 * @returns {HTMLInputElement[]}
	 */
	const $$inputs = (root, selector) => /** @type {HTMLInputElement[]} */ ([...root.querySelectorAll(selector)]);
	/**
	 * The element an event happened on (SlimeBeep only listens on its own elements).
	 * @param {Event} e
	 * @returns {HTMLElement}
	 */
	const targetOf = (e) => /** @type {HTMLElement} */ (e.target);
	/**
	 * The <input> or <textarea> an event happened on.
	 * @param {Event} e
	 * @returns {HTMLInputElement}
	 */
	const inputOf = (e) => /** @type {HTMLInputElement} */ (e.target);
	/** Whether a player is logged in. */
	const loggedIn = () =>
		typeof ServerSocket !== 'undefined' && ServerSocket && typeof Player !== 'undefined' && Player && Player.MemberNumber != null;
	/** Name of the chat room you are in, or null. */
	const myRoom = () => (typeof ChatRoomData !== 'undefined' && ChatRoomData && ChatRoomData.Name) || null;
	/** The game's beep log ([] when missing). */
	const gameLog = () => (typeof FriendListBeepLog !== 'undefined' && Array.isArray(FriendListBeepLog) ? FriendListBeepLog : []);
	/** The chat history. */
	const log = () => hist;

	/** Loads `hist` (and the group state) for the logged-in account. */
	function loadHistory() {
		hist = [];
		histKeys.clear();
		live.clear();
		histOwner = Player.MemberNumber;
		loadGC();
		deletedKeys.clear();
		try {
			const keys = JSON.parse(localStorage.getItem(deletedKey()) || '[]');
			if (Array.isArray(keys)) {
				for (const k of keys) {
					if (typeof k === 'string') {
						deletedKeys.add(k);
					}
				}
			}
		} catch (e) {
			/* unreadable: nothing hidden */
		}
		if (!opts.keep) {
			return;
		}
		try {
			const saved = JSON.parse(localStorage.getItem(histKey()) || '[]');
			if (Array.isArray(saved)) {
				for (const h of saved) {
					if (h && h.k && !histKeys.has(h.k) && !deletedKeys.has(h.k) && (h.group ? !!groups[h.group] : !isSignal(h.Message))) {
						hist.push(h);
						histKeys.add(h.k);
					}
				}
			}
		} catch (e) {
			/* unreadable: start fresh */
		}
	}

	/** Saves `hist` when opts.keep is on; if storage is full, drops the older half. */
	function saveHistory() {
		if (!opts.keep) {
			return;
		}
		try {
			localStorage.setItem(histKey(), JSON.stringify(hist.slice(-KEEP_MAX)));
		} catch (e) {
			hist = hist.slice(-Math.floor(KEEP_MAX / 2));
			try {
				localStorage.setItem(histKey(), JSON.stringify(hist));
			} catch (e2) {
				/* the browser won't keep it */
			}
		}
	}

	/**
	 * Deletes messages from your chats, for you only: nothing is sent, so everyone else keeps theirs. Keys
	 * that could come back (from the game's log, the relay or a mailbox) go into `deletedKeys`. Whispers ('w:')
	 * and beeps SlimeBeep caught itself ('raw:') are keyed by when they arrived, so they can't.
	 * @param {(h: HistEntry) => boolean} which
	 */
	function deleteMessages(which) {
		const gone = new Set(hist.filter(which).map((h) => h.k));
		if (!gone.size) {
			return;
		}
		hist = hist.filter((h) => !gone.has(h.k));
		for (const k of gone) {
			histKeys.delete(k);
			if (!/^(w|raw):/.test(k)) {
				deletedKeys.add(k);
			}
		}
		const kept = [...deletedKeys].slice(-DELETED_MAX);
		deletedKeys.clear();
		for (const k of kept) {
			deletedKeys.add(k);
		}
		try {
			localStorage.setItem(deletedKey(), JSON.stringify(kept));
		} catch (e) {
			/* hidden this visit only */
		}
		saveHistory();
	}

	/**
	 * Copies beeps from the game's log into `hist`.
	 * @returns {HistEntry[]} the received beeps added this time (no reactions)
	 */
	function sync() {
		if (!loggedIn()) {
			return [];
		}
		if (histOwner !== Player.MemberNumber) {
			loadHistory();
		}
		/** @type {HistEntry[]} */
		const added = [];
		for (const b of gameLog()) {
			if (!b || typeof b !== 'object' || b.MemberNumber == null) {
				continue;
			}
			const k = keyOf(b);
			if (live.has(k)) {
				continue;
			}
			live.set(k, b);
			if (histKeys.has(k) || deletedKeys.has(k) || isSignal(b.Message)) {
				continue;
			}
			/** @type {HistEntry} */
			const h = {
				k,
				MemberNumber: b.MemberNumber,
				MemberName: b.MemberName,
				Sent: !!b.Sent,
				Time: new Date(b.Time).getTime() || Date.now(),
				Message: b.Message,
				ChatRoomName: b.ChatRoomName,
			};
			hist.push(h);
			histKeys.add(k);
			added.push(h);
		}
		if (added.length) {
			hist.sort((a, b) => a.Time - b.Time);
			if (hist.length > KEEP_MAX) {
				for (const h of hist.splice(0, hist.length - KEEP_MAX)) {
					histKeys.delete(h.k);
				}
			}
			saveHistory();
		}
		return added.filter((h) => !h.Sent && !isReaction(h));
	}
	/** Character after which the game appends a beep's settings (JSON: name colour, message type). */
	const MARK = '';
	/**
	 * A beep's settings, as the game appends them.
	 * @typedef {object} BeepMeta
	 * @property {string} [messageType] 'Message', 'Reply', 'Reaction'...
	 */
	/**
	 * Splits a beep's message into its text and the settings the game appended after MARK.
	 * @param {unknown} msg
	 * @returns {{ text: string, meta: BeepMeta | null }}
	 */
	function parseBeep(msg) {
		if (typeof msg !== 'string') {
			return { text: '', meta: null };
		}
		let text = msg,
			raw = null;
		const i = msg.indexOf(MARK);
		if (i >= 0) {
			text = msg.slice(0, i);
			raw = msg.slice(msg.lastIndexOf(MARK) + 1);
		} else {
			// MARK stripped by another add-on: a last line holding the settings object.
			const m = /\n\s*(\{"messageType"[^\n]*\})\s*$/.exec(msg);
			if (m) {
				text = msg.slice(0, m.index);
				raw = m[1];
			}
		}
		let meta = null;
		if (raw) {
			try {
				const x = JSON.parse(raw);
				if (x && typeof x === 'object' && !Array.isArray(x)) {
					meta = x;
				}
			} catch (e) {
				/* not settings */
			}
		}
		return { text: text.trimEnd(), meta };
	}
	/**
	 * Whether a beep is another add-on's data rather than a message (never shown): a JSON object or
	 * array, optionally after a short tag ("KIKILINK/1 {...}"), or, when the beep had its own BeepType,
	 * a CamelCase word like "ReqRoom". BCT's beeps (BeepType "bctBeep") carry any single word, such as
	 * "Friends" and "BFLockAcc".
	 * @param {unknown} msg
	 * @param {string} [type] the beep's BeepType
	 */
	function isSignal(msg, type = '') {
		if (typeof msg !== 'string') {
			return false;
		}
		const t = parseBeep(msg).text.trim();
		if (!t) {
			return false;
		}
		if (type && /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+$/.test(t)) {
			return true;
		}
		if (type === 'bctBeep' && /^[A-Za-z]\w*$/.test(t)) {
			return true;
		}
		// It has to parse into a non-empty object (or array after a tag).
		const m = /^([^\s{[]{0,40})\s*([[{][\s\S]*[\]}])$/.exec(t);
		if (!m) {
			return false;
		}
		try {
			const x = JSON.parse(m[2]);
			if (Array.isArray(x)) {
				return m[1].length > 0 && x.length > 0;
			}
			return !!x && typeof x === 'object' && Object.keys(x).length > 0;
		} catch (e) {
			return false;
		}
	}
	/**
	 * What a `hist` entry shows as its text.
	 * @param {HistEntry} entry
	 * @returns {string}
	 */
	const textOf = (entry) => {
		if (entry.group) {
			return entry.sys === 'left' ? `${entry.MemberName} left the group` : entry.text || '';
		}
		if (typeof entry.Message !== 'string') {
			return entry.ChatRoomName ? `📍 ${entry.ChatRoomName}` : '🔔 Beep!';
		}
		return parseBeep(entry.Message).text || '🔔 Beep!';
	};
	/**
	 * Whether a beep is a reaction (the game's messageType 'Reaction'); those are not listed.
	 * @param {HistEntry} entry
	 */
	const isReaction = (entry) => {
		const meta = typeof entry.Message === 'string' ? parseBeep(entry.Message).meta : null;
		return !!meta && meta.messageType === 'Reaction';
	};
	/**
	 * Whether a received entry is unread: the game's Read flag when the game has the beep, else `h.unread`.
	 * Whispers never are: the room chat showed them.
	 * @param {HistEntry} h
	 */
	const unread = (h) => {
		if (h.Sent || h.whisper || isReaction(h)) {
			return false;
		}
		const b = live.get(h.k);
		return b ? b.Read === false : !!h.unread;
	};
	/**
	 * Marks an entry read, in the game's log too.
	 * @param {HistEntry} h
	 */
	const markRead = (h) => {
		const b = live.get(h.k);
		if (b && b.Read === false) {
			b.Read = true;
		}
		if (h.unread) {
			h.unread = false;
			saveHistory();
		}
	};
	/** Marks every message read, chats and groups, in the game's log too, without deleting any. */
	function markAllRead() {
		for (const h of hist) {
			if (!unread(h)) {
				continue;
			}
			const b = live.get(h.k);
			if (b) {
				b.Read = true;
			}
			h.unread = false;
		}
		saveHistory();
		render(true);
	}
	/**
	 * A member's name: from the online friends, the friend list, or the last beep they sent.
	 * @param {number} n
	 * @returns {string}
	 */
	const nameOf = (n) => {
		const f = friends.find((x) => x.MemberNumber === n);
		if (f) {
			return f.MemberName;
		}
		const known = typeof Player !== 'undefined' && Player && Player.FriendNames && Player.FriendNames.get(n);
		if (known) {
			return known;
		}
		const b = [...log()].reverse().find((x) => x.MemberNumber === n && !x.Sent);
		return b ? b.MemberName : `#${n}`;
	};
	/**
	 * A message as the action it is, the way the game shows them: "*waves" (or "*waves*", /me) from Ann reads
	 * "*Ann waves*" and "**the lights flicker**" reads "*the lights flicker*". Null for an ordinary message.
	 * @param {string} text
	 * @param {string} name who sent it
	 * @returns {string | null}
	 */
	const asAction = (text, name) => {
		const t = String(text).trim();
		if (!t.startsWith('*')) {
			return null;
		}
		const wrap = /^(\*{1,2})([\s\S]*)\1$/.exec(t);
		const inner = (wrap ? wrap[2] : t.replace(/^\*{1,2}/, '')).trim();
		if (!inner) {
			return null;
		}
		return t.startsWith('**') ? `*${inner}*` : `*${name} ${inner}*`;
	};
	/** Group invite codes inside a text. */
	const CODE_IN = /SB-[a-z0-9]{8,24}-[A-Z2-9]{10}/g;
	/** @type {Record<string, string>} Undoes ESCAPES. */
	const UNESCAPES = Object.fromEntries(Object.entries(ESCAPES).map(([c, e]) => [e, c]));
	/** Image hosts whose pictures show in chats without asking (more can be trusted, see opts.trustedHosts). */
	const EMBED_HOSTS = new Set([
		'media.tenor.com',
		'media1.tenor.com',
		'c.tenor.com',
		'media.giphy.com',
		'media0.giphy.com',
		'media1.giphy.com',
		'media2.giphy.com',
		'media3.giphy.com',
		'media4.giphy.com',
		'i.giphy.com',
		'i.imgur.com',
		'cdn.discordapp.com',
		'media.discordapp.net',
		'files.catbox.moe',
		'i.redd.it',
		'pbs.twimg.com',
	]);
	/**
	 * The picture behind a link: a picture file on any https site, or the GIF of a Tenor or Giphy page.
	 * @param {string} link
	 * @returns {{ src: string, host: string } | null}
	 */
	const picOf = (link) => {
		let url;
		try {
			url = new URL(link);
		} catch (e) {
			return null;
		}
		if (url.protocol !== 'https:') {
			return null;
		}
		const host = url.hostname.replace(/^www\./, '');
		// Tenor answers a page address with ".gif" added by redirecting to the GIF itself.
		const tenor = host === 'tenor.com' && /^(?:\/[a-z]{2}(?:-[A-Z]{2})?)?(\/view\/[\w-]+-\d+)$/.exec(url.pathname);
		if (tenor) {
			return { src: `https://tenor.com${tenor[1]}.gif`, host: 'media.tenor.com' };
		}
		const giphy = host === 'giphy.com' && /^\/gifs\/(?:[\w-]*-)?([A-Za-z0-9]+)\/?$/.exec(url.pathname);
		if (giphy) {
			return { src: `https://i.giphy.com/${giphy[1]}.gif`, host: 'i.giphy.com' };
		}
		return /\.(?:png|jpe?g|gif|webp)$/i.test(url.pathname) ? { src: url.href, host } : null;
	};
	/** @type {Set<string>} Pictures from untrusted sites shown once this visit with "Show". */
	const shownOnce = new Set();
	/** @type {Map<string, { w: number, h: number }>} Sizes of the chat pictures already loaded, by address, so a redraw keeps their space before they load again. */
	const picSizes = new Map();
	/** Largest size of a picture in a chat, in px. */
	const EMBED_MAX = { w: 220, h: 240 };
	/**
	 * A chat picture under its link, in the space it took last time when it has loaded before. A picture
	 * from a site that isn't trusted asks first, since loading it tells that site who opened the chat.
	 * @param {string} link the link, escaped
	 * @param {{ src: string, host: string }} pic
	 */
	const embedHtml = (link, pic) => {
		const src = esc(pic.src);
		if (!EMBED_HOSTS.has(pic.host) && !opts.trustedHosts.includes(pic.host) && !shownOnce.has(pic.src)) {
			const host = esc(pic.host);
			return `<span class="sb-asktrust">🖼 A picture from <b>${host}</b> <button class="sb-pill" data-pic-once="${src}">Show</button> <button class="sb-pill" data-pic-trust="${host}">Always trust ${host}</button></span>`;
		}
		const size = picSizes.get(pic.src);
		let style = '';
		if (size) {
			const scale = Math.min(1, EMBED_MAX.w / size.w, EMBED_MAX.h / size.h);
			style = ` style="width:${Math.round(size.w * scale)}px;aspect-ratio:${size.w} / ${size.h}"`;
		}
		return `<a class="sb-embed" href="${link}" target="_blank" rel="noopener noreferrer nofollow"><img src="${src}" alt="" loading="lazy" referrerpolicy="no-referrer"${style}></a>`;
	};
	/**
	 * A message as HTML: escaped, with *actions* in italics, clickable links (new tab), pictures under
	 * picture links (see embedHtml), ▶ Play after song links (see trackOf) and a Join button after group codes.
	 * @param {string} text
	 */
	const rich = (text) =>
		trustedHtml(
			esc(text)
				.replace(/\*{1,2}([^*\n]{1,300}?)\*{1,2}/g, '<i class="sb-emote">*$1*</i>')
				.replace(/\bhttps?:\/\/[^\s<>"']+/g, (url) => {
					const tail = (/(?:[.,!?:;)\]]|&#39;|&quot;)+$/.exec(url) || [''])[0];
					const link = url.slice(0, url.length - tail.length);
					const raw = link.replace(/&(?:amp|lt|gt|quot|#39);/g, (e) => UNESCAPES[e]);
					const pic = picOf(raw);
					const play = trackOf(raw)
						? ` <button class="sb-pill sb-playlink" data-play="${link}" title="Play it in SlimeBeep">▶ Play</button>`
						: '';
					return `<a class="sb-link" href="${link}" target="_blank" rel="noopener noreferrer nofollow">${link}</a>${play}${tail}${pic ? embedHtml(link, pic) : ''}`;
				})
				.replace(
					CODE_IN,
					(code) => `${code} <button class="sb-pill sb-joincode" data-code="${code}">${groups[codeGroup(code)] ? 'Open' : 'Join'}</button>`,
				),
		);
	/**
	 * The group id inside an invite code ('' if it isn't one).
	 * @param {string} code
	 */
	const codeGroup = (code) => {
		const m = CODE_RE.exec(code);
		return m ? m[1] : '';
	};
	/**
	 * A time as hh:mm today, or as a date.
	 * @param {number | string | Date} t
	 */
	const timeOf = (t) => {
		const d = new Date(t);
		if (isNaN(d.getTime())) {
			return '';
		}
		const today = new Date().toDateString() === d.toDateString();
		return today
			? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			: d.toLocaleDateString([], { day: 'numeric', month: 'short' });
	};
	/**
	 * Hue of a member's letter avatar.
	 * @param {number} n
	 */
	const hue = (n) => (Number(n) * 137) % 360;
	/** A profile picture: only image data URLs are accepted (never a web address). */
	const PFP_RE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/;
	/** Longest picture data URL accepted (a 128 px picture, smaller if needed). */
	const PFP_MAX = 12000;
	/** Characters of picture per hidden beep. */
	const PFP_CHUNK = 900;
	/**
	 * A profile picture.
	 * @typedef {object} Picture
	 * @property {string} v version id (a new one for each new picture)
	 * @property {string} data an image data URL (PFP_RE)
	 */
	/** @type {Record<number, Picture> | null} Friends' pictures received by hidden beeps. Lazy, see loadPfps. */
	let pfps = null;
	/**
	 * `pfps`, loaded from localStorage on first use.
	 * @returns {Record<number, Picture>}
	 */
	function loadPfps() {
		if (pfps) {
			return pfps;
		}
		/** @type {Record<number, Picture>} */
		const loaded = {};
		pfps = loaded;
		try {
			/** @type {Record<string, Partial<Picture>>} */
			const saved = JSON.parse(localStorage.getItem('slimebeep.pfps') || '{}');
			for (const [k, x] of Object.entries(saved)) {
				if (isNum(Number(k)) && x && isId(x.v) && typeof x.data === 'string' && x.data.length <= PFP_MAX && PFP_RE.test(x.data)) {
					loaded[Number(k)] = { v: x.v, data: x.data };
				}
			}
		} catch (e) {
			/* unreadable: none */
		}
		return loaded;
	}
	/** Saves `pfps`, keeping the last 300. */
	function savePfps() {
		const all = loadPfps();
		const keys = Object.keys(all).map(Number);
		for (const k of keys.slice(0, Math.max(0, keys.length - 300))) {
			delete all[k];
		}
		try {
			localStorage.setItem('slimebeep.pfps', JSON.stringify(all));
		} catch (e) {
			/* the browser won't keep it */
		}
	}
	/** localStorage key of the logged-in account's own picture. */
	const pfpKey = () => `slimebeep.pfp.${Player.MemberNumber}`;
	/** @type {{ owner: number, pic: Picture | null } | null} Cached result of myPfp, for one account. */
	let myPic = null;
	/**
	 * The logged-in account's own picture, or null. A picture saved by an older version in the shared
	 * options moves to the first account that logs in afterwards.
	 * @returns {Picture | null}
	 */
	function myPfp() {
		if (!loggedIn()) {
			return null;
		}
		const me = Player.MemberNumber;
		if (myPic && myPic.owner === me) {
			return myPic.pic;
		}
		/** @type {Partial<Picture> | null} */
		let x = null;
		try {
			x = JSON.parse(localStorage.getItem(pfpKey()) || 'null');
		} catch (e) {
			x = null;
		}
		const legacy = /** @type {{ pfp?: Partial<Picture> | null }} */ (/** @type {unknown} */ (opts));
		if ('pfp' in legacy) {
			if (!x && legacy.pfp) {
				x = legacy.pfp;
				try {
					localStorage.setItem(pfpKey(), JSON.stringify(x));
				} catch (e) {
					/* this visit only */
				}
			}
			delete legacy.pfp;
			saveOpts();
		}
		const pic = x && isId(x.v) && typeof x.data === 'string' && PFP_RE.test(x.data) ? { v: x.v, data: x.data } : null;
		myPic = { owner: me, pic };
		return pic;
	}
	/**
	 * Sets (or with null removes) the logged-in account's own picture.
	 * @param {Picture | null} pic
	 */
	function setMyPfp(pic) {
		myPic = { owner: Player.MemberNumber, pic };
		try {
			if (pic) {
				localStorage.setItem(pfpKey(), JSON.stringify(pic));
			} else {
				localStorage.removeItem(pfpKey());
			}
		} catch (e) {
			/* this visit only */
		}
		saveBackup();
	}
	/**
	 * A member's picture: yours, a friend's from `pfps`, or one a group shared (`relayPics`).
	 * @param {number} n
	 * @returns {{ data: string } | null}
	 */
	const pfpOf = (n) =>
		(loggedIn() && n === Player.MemberNumber ? myPfp() : loadPfps()[n] || (relayPics[n] ? { data: relayPics[n] } : null)) || null;
	/**
	 * A group's avatar HTML: its picture or 👥.
	 * @param {{ pic?: string }} g
	 */
	const groupAv = (g) => (g.pic ? html`<img class="sb-av sb-pic" src="${g.pic}" alt="">` : html`<span class="sb-av sb-gav">👥</span>`);
	/** The slime logo as a card icon. */
	const logoIcon = () => html`<img src="${ICON}" style="width:34px;height:34px;border-radius:50%;flex:none" alt="">`;
	/**
	 * A member's avatar HTML: their picture or their initials.
	 * @param {number} n
	 * @param {string} [name]
	 */
	const avatar = (n, name) => {
		const pic = pfpOf(n);
		if (pic) {
			return html`<img class="sb-av sb-pic" src="${pic.data}" alt="">`;
		}
		const initials = String(name || '?')
			.trim()
			.slice(0, 2);
		return html`<span class="sb-av" style="background:hsl(${hue(n)} 85% 80%)">${initials}</span>`;
	};

	/**
	 * A drawn icon (24 x 24 grid, stroked in the text colour). Symbols like ✕ or ⏻ sit off-centre in
	 * some fonts; these are centred everywhere.
	 * @param {number} size in px
	 * @param {SafeHtml} shape the paths
	 */
	const svgIcon = (size, shape) =>
		html`<svg class="sb-ic" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${shape}</svg>`;
	/** The icons of SlimeBeep's round buttons. */
	const ICONS = {
		close: svgIcon(14, html`<path d="M6 6l12 12M18 6 6 18"/>`),
		// A cog with eight teeth around a hole.
		gear: svgIcon(
			17,
			html`<path d="M18.9 9.9L21.9 10.4L21.9 13.6L18.9 14.1L18.4 15.4L20.1 17.9L17.9 20.1L15.4 18.4L14.1 18.9L13.6 21.9L10.4 21.9L9.9 18.9L8.6 18.4L6.1 20.1L3.9 17.9L5.6 15.4L5.1 14.1L2.1 13.6L2.1 10.4L5.1 9.9L5.6 8.6L3.9 6.1L6.1 3.9L8.6 5.6L9.9 5.1L10.4 2.1L13.6 2.1L14.1 5.1L15.4 5.6L17.9 3.9L20.1 6.1L18.4 8.6Z" stroke-width="2.2"/><circle cx="12" cy="12" r="3" stroke-width="2.2"/>`,
		),
		send: svgIcon(18, html`<path d="M4 11.5 20 4l-6.5 16-2.6-6.4z" fill="currentColor"/>`),
		back: svgIcon(22, html`<path d="M15 4.5 7.5 12l7.5 7.5" stroke-width="3.2"/>`),
		down: svgIcon(14, html`<path d="M12 5v14M6 13l6 6 6-6"/>`),
		play: svgIcon(14, html`<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke-width="2"/>`),
		pause: svgIcon(14, html`<path d="M8 5v14M16 5v14" stroke-width="3.4"/>`),
		prev: svgIcon(14, html`<path d="M6 5v14M19 5 9 12l10 7z" fill="currentColor" stroke-width="2"/>`),
		next: svgIcon(14, html`<path d="M18 5v14M5 5l10 7-10 7z" fill="currentColor" stroke-width="2"/>`),
	};
	const css = `
		#sb-toggle { position: fixed; z-index: 100000; width: 46px; height: 46px; border-radius: 50%; padding: 0; overflow: visible;
			border: 3px solid #fff; background: #ffd6ec; cursor: pointer; box-shadow: 0 3px 10px #ff4fa366; touch-action: none; }
		#sb-toggle img { width: 100%; height: 100%; display: block; border-radius: 50%; pointer-events: none; }
		#sb-toggle.dragging { cursor: grabbing; opacity: .8; }
		#sb-badge { position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px; padding: 0 4px; box-sizing: border-box;
			border-radius: 9px; background: #ff2e8a; color: #fff; font: bold 11px/18px sans-serif; text-align: center; border: 2px solid #fff; display: none; }
		#sb-panel { position: fixed; z-index: 99999; width: 340px; height: 480px; display: none; flex-direction: column; overflow: hidden;
			border-radius: 22px; background: #fff7fb; color: #4a2340; box-shadow: 0 8px 30px #c2186b55; border: 3px solid #ffc2e2;
			font: 13px "Trebuchet MS", "Segoe UI", sans-serif; color-scheme: light; }
		#sb-panel, #sb-panel * { box-sizing: border-box; text-align: left; line-height: 1.3; letter-spacing: normal; text-transform: none; }
		#sb-panel button { font: inherit; cursor: pointer; }
		#sb-panel textarea:focus, #sb-panel input:focus { outline: none; border-color: #ff7ab8 !important; box-shadow: 0 0 0 3px #ffd1e8; }
		#sb-panel input[type=checkbox] { accent-color: #ff4fa3; margin: 0 6px 0 0; vertical-align: middle; }
		.sb-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #fff;
			background: linear-gradient(120deg, #ff6fb5, #ff9fd0 55%, #9fe8ff); text-shadow: 0 1px 2px #c2186b88; }
		.sb-head img { width: 30px; height: 30px; border-radius: 50%; background: #fff; border: 2px solid #fff; }
		.sb-head b { font-size: 16px; flex: 1; }
		.sb-head small { opacity: .85; font-weight: normal; font-size: 11px; }
		.sb-head button { border: none; background: #ffffff55; color: #fff; width: 28px; height: 28px; border-radius: 50%; font-size: 14px; }
		.sb-head button:hover { background: #ffffff88; }
		.sb-head #sb-music.playing { background: #fff; box-shadow: 0 0 0 2px #ff4fa3, 0 0 8px #ff4fa3aa; }
		.sb-head { cursor: move; touch-action: none; user-select: none; }
		/* Resize edges and corners of the window. */
		.sb-rs { position: absolute; z-index: 3; touch-action: none; }
		.sb-rs[data-rs="n"], .sb-rs[data-rs="s"] { left: 14px; right: 14px; height: 6px; cursor: ns-resize; }
		.sb-rs[data-rs="e"], .sb-rs[data-rs="w"] { top: 14px; bottom: 14px; width: 6px; cursor: ew-resize; }
		.sb-rs[data-rs="nw"], .sb-rs[data-rs="ne"], .sb-rs[data-rs="sw"], .sb-rs[data-rs="se"] { width: 14px; height: 14px; }
		.sb-rs[data-rs="n"], .sb-rs[data-rs="nw"], .sb-rs[data-rs="ne"] { top: 0; }
		.sb-rs[data-rs="s"], .sb-rs[data-rs="sw"], .sb-rs[data-rs="se"] { bottom: 0; }
		.sb-rs[data-rs="w"], .sb-rs[data-rs="nw"], .sb-rs[data-rs="sw"] { left: 0; }
		.sb-rs[data-rs="e"], .sb-rs[data-rs="ne"], .sb-rs[data-rs="se"] { right: 0; }
		.sb-rs[data-rs="nw"], .sb-rs[data-rs="se"] { cursor: nwse-resize; }
		.sb-rs[data-rs="ne"], .sb-rs[data-rs="sw"] { cursor: nesw-resize; }
		.sb-head button, .sb-thead button, .sb-compose button, .sb-emo-tabs button, .sb-emo-grid button { padding: 0; display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
		.sb-tabs { display: flex; gap: 3px; padding: 8px 8px 6px; background: #ffe6f3; }
		.sb-tabs button { flex: 1 1 auto; min-width: 0; white-space: nowrap; border: none; border-radius: 14px; padding: 5px 5px; background: #fff; color: #c2186b; text-align: center; }
		.sb-tabs button.on { background: #ff4fa3; color: #fff; box-shadow: 0 2px 6px #ff4fa366; }
		.sb-tabs button i { font-style: normal; background: #ff2e8a; color: #fff; border-radius: 8px; padding: 0 5px; margin-left: 4px; font-size: 10px; }
		.sb-tabs button.on i { background: #fff; color: #ff2e8a; }
		.sb-body { flex: 1; overflow-y: auto; padding: 6px 10px 10px; }
		.sb-body::-webkit-scrollbar { width: 6px; } .sb-body::-webkit-scrollbar-thumb { background: #ffb3d9; border-radius: 3px; }
		#sb-panel .sb-readall { display: block; margin: -2px 0 6px auto; font-size: 11px; }
		.sb-search { width: 100%; border: 2px solid #ffd1e8; border-radius: 14px; padding: 5px 10px; margin: 2px 0 6px; background: #fff; color: #4a2340; font: inherit; }
		.sb-row { display: flex; align-items: center; gap: 8px; padding: 7px 8px; margin: 4px 0; border-radius: 16px; background: #fff;
			border: 1px solid #ffe0ef; cursor: pointer; }
		.sb-row:hover { background: #fff0f8; border-color: #ffb3d9; }
		.sb-av { flex: none; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
			font-weight: bold; color: #6b2457; border: 2px solid #fff; box-shadow: 0 1px 3px #0002; }
		.sb-main { flex: 1; min-width: 0; }
		.sb-name { font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.sb-sub { color: #a0638a; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.sb-side { flex: none; text-align: right; font-size: 11px; color: #c08aaa; }
		.sb-dot { display: inline-block; min-width: 16px; height: 16px; border-radius: 8px; background: #ff2e8a; color: #fff;
			font-size: 10px; line-height: 16px; text-align: center; padding: 0 4px; margin-top: 3px; }
		.sb-on { width: 9px; height: 9px; border-radius: 50%; background: #5fe0a8; display: inline-block; margin-right: 4px; }
		.sb-off { width: 9px; height: 9px; border-radius: 50%; background: #d7c3cf; display: inline-block; margin-right: 4px; }
		.sb-row.offline { opacity: .6; }
		.sb-empty { text-align: center; color: #c08aaa; padding: 30px 10px; }
		.sb-thead { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #ffe6f3; }
		.sb-thead button { border: none; background: #fff; color: #ff4fa3; width: 28px; height: 28px; border-radius: 50%; font-size: 15px; }
		#sb-mu { position: fixed; z-index: 99999; width: 300px; display: none; flex-direction: column; overflow: hidden; border-radius: 18px;
			background: #fff7fb; color: #4a2340; box-shadow: 0 8px 30px #c2186b55; border: 3px solid #ffc2e2;
			font: 13px "Trebuchet MS", "Segoe UI", sans-serif; color-scheme: light; }
		#sb-mu.on { display: flex; }
		#sb-mu, #sb-mu * { box-sizing: border-box; text-align: left; line-height: 1.3; letter-spacing: normal; text-transform: none; }
		#sb-mu button { font: inherit; cursor: pointer; }
		#sb-mu button:disabled { opacity: .4; cursor: default; }
		#sb-mu .sb-head { padding: 8px 10px; }
		#sb-mu .sb-head b { font-size: 14px; }
		.sb-mu-now { display: flex; gap: 10px; align-items: center; padding: 10px 12px 4px; }
		.sb-mu-art { flex: none; width: 64px; height: 64px; border-radius: 12px; overflow: hidden; background: linear-gradient(135deg, #ff9ccf, #ff4fa3);
			display: flex; align-items: center; justify-content: center; }
		.sb-mu-art::before { content: '🎵'; font-size: 30px; }
		#sb-mu.yt .sb-mu-art { width: 112px; height: 63px; background: #000; }
		#sb-mu.yt .sb-mu-art::before { content: none; }
		.sb-mu-art iframe { width: 112px; height: 63px; border: 0; display: block; position: static; }
		.sb-mu-art audio { display: none; }
		.sb-mu-info { flex: 1; min-width: 0; }
		.sb-mu-title { font-weight: bold; font-size: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
		.sb-mu-status { font-size: 11px; color: #c08aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
		.sb-mu-progress { display: flex; align-items: center; gap: 6px; padding: 4px 12px; font-size: 10px; color: #c08aaa; }
		#sb-mu input[type=range] { accent-color: #ff4fa3; margin: 0; height: 14px; }
		#sb-mu-seek { flex: 1; min-width: 0; }
		.sb-mu-controls { display: flex; align-items: center; gap: 8px; padding: 2px 12px 10px; }
		.sb-mu-controls button, .sb-mu-add button { flex: none; border: none; background: #fff; color: #ff4fa3; width: 32px; height: 32px; border-radius: 50%;
			padding: 0; display: inline-flex; align-items: center; justify-content: center; line-height: 1; box-shadow: 0 1px 4px #c2186b22; }
		.sb-mu-controls .sb-mu-big { width: 42px; height: 42px; background: linear-gradient(135deg, #ff6fb5, #ff4fa3); color: #fff; }
		.sb-mu-vol { margin-left: auto; display: flex; align-items: center; gap: 4px; }
		.sb-mu-controls .sb-mu-vol button { width: 28px; height: 28px; box-shadow: none; background: transparent; }
		#sb-mu-vol { width: 70px; }
		.sb-mu-more { border-top: 1px solid #ffd1e8; padding: 8px 12px 10px; display: flex; flex-direction: column; gap: 6px; }
		.sb-mu-add { display: flex; gap: 6px; align-items: center; }
		.sb-mu-add .sb-search { flex: 1; min-width: 0; margin: 0; }
		.sb-mu-queue { max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
		.sb-mu-queue:empty { display: none; }
		.sb-mu-row { display: flex; align-items: center; border-radius: 8px; }
		.sb-mu-row.on { background: #ffe6f3; }
		.sb-mu-song { flex: 1; min-width: 0; border: 0; background: none; color: inherit; padding: 4px 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
		.sb-status { font-size: 11px; font-style: italic; color: #b0628f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.sb-merow { margin-bottom: 6px; }
		.sb-tr { margin-top: 4px; padding-top: 4px; border-top: 1px dashed #ff9ccf88; font-style: italic; }
		.sb-tr small { opacity: .7; font-style: normal; }
		.sb-trbtn { text-decoration: none; opacity: .65; }
		.sb-trbtn:hover { opacity: 1; }
		.sb-thead > button#sb-trset { flex: none; font-size: 13px; }
		.sb-thead > button#sb-trset.on { box-shadow: 0 0 0 2px #ff4fa3; }
		.sb-tr-pick { display: flex; align-items: center; gap: 6px; }
		.sb-tr-pick select { flex: 1; min-width: 0; font: inherit; border: 2px solid #ffb3d9; border-radius: 10px; padding: 3px 6px; background: #fff; color: inherit; }
		.sb-achbtn { flex: none; font-size: 11px; padding: 2px 8px; }
		.sb-trophy { font: inherit; font-style: normal; margin-right: 4px; border: 0; padding: 0 5px; border-radius: 8px; background: #fff4c2; color: #a8740a; cursor: pointer; }
		html.sb-night .sb-trophy { background: #3a2f0c; color: #ffd23f; }
		.sb-ach-card { width: 300px; align-items: stretch; max-height: calc(100% - 90px); }
		.sb-ach-list { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
		.sb-ach { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 12px; background: #f6eef3; opacity: .55; }
		.sb-ach.on { background: linear-gradient(135deg, #fff4c2, #ffe6f3); opacity: 1; }
		.sb-ach .sb-sub { display: block; white-space: normal; }
		.sb-ach-emoji { font-size: 20px; width: 26px; text-align: center; }
		html.sb-night .sb-ach { background: #1d2550; }
		html.sb-night .sb-ach.on { background: linear-gradient(135deg, #3a2f0c, #253064); }
		.sb-status-card { width: 280px; align-items: stretch; }
		.sb-status-card .sb-search { margin: 0; }
		.sb-status-card label { display: flex; align-items: center; gap: 6px; }
		.sb-mu-ears { display: flex; flex-wrap: wrap; gap: 2px; margin-top: 3px; }
		.sb-mu-ears:empty { display: none; }
		.sb-mu-ears .sb-av { width: 16px; height: 16px; font-size: 7px; border: 0; }
		.sb-mu-by { flex: none; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; opacity: .7; padding-right: 4px; }
		.sb-mu-del { flex: none; border: 0; background: none; color: #c08aaa; width: 24px; height: 24px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
		#sb-mu .sb-mu-share { width: 100%; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.sb-mu-share.on { background: #ff4fa3; color: #fff; }
		#sb-mu.mini .sb-mu-more, #sb-mu.mini .sb-mu-progress { display: none; }
		#sb-mu.mini #sb-mu-mini svg { transform: rotate(180deg); }
		.sb-jamline { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #fff0f8; border-bottom: 1px solid #ffd1e8; font-size: 12px; white-space: nowrap; overflow: hidden; }
		.sb-jamline b { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
		.sb-jamline .sb-pill { flex: none; padding: 2px 10px; font-size: 11px; }
		.sb-jamline.on { background: #ffe6f3; }
		.sb-playlink { margin-left: 4px; padding: 1px 8px !important; font-size: 11px !important; }
		.sb-thead #sb-back { width: 36px; height: 36px; flex: none; }
		/* Pages and add-ons can style every svg; the icons stay put. Clicks go to their button. */
		svg.sb-ic { display: block; position: static; flex: none; margin: 0; padding: 0; opacity: 1; transform: none; overflow: visible; pointer-events: none; }
		.sb-card .sb-x { display: inline-flex; align-items: center; justify-content: center; }
		.sb-msgs { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px;
			background: radial-gradient(circle at 20% 10%, #fff 0, #fff7fb 60%); }
		.sb-b { position: relative; max-width: 78%; padding: 7px 11px; border-radius: 18px; white-space: pre-wrap; word-wrap: break-word; }
		/* A message's ↩ and 🗑 sit inside it, right of the time: the whole bubble holds the hover. Their space is kept
		   while hidden, so the bubble doesn't change size under the mouse. */
		#sb-panel .sb-acts { display: flex; margin: -3px -5px -3px auto; padding-left: 8px; visibility: hidden; }
		#sb-panel .sb-b.me .sb-acts { margin-left: 0; }
		#sb-panel .sb-acts button { width: 22px; height: 20px; padding: 0; border: none; background: none; font-size: 12px; line-height: 1;
			display: flex; align-items: center; justify-content: center; opacity: .75; }
		#sb-panel .sb-acts button:hover { opacity: 1; }
		#sb-panel .sb-b:hover .sb-acts, #sb-panel .sb-b.sb-tap .sb-acts { visibility: visible; }
		.sb-quote { display: block; margin-bottom: 3px; padding-left: 7px; border-left: 3px solid #ff8fc8; font-size: 11px; opacity: .75;
			white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.sb-b.sb-mention { box-shadow: 0 0 0 2px #ffb84d; }
		.sb-replybar { display: flex; align-items: center; gap: 5px; padding: 4px 10px; font-size: 11px; background: #ffd3ea; }
		.sb-replybar span { flex: 1; min-width: 0; opacity: .75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		#sb-panel .sb-replybar button { border: none; background: none; padding: 0 4px; font-size: 12px; }
		.sb-compose { position: relative; }
		#sb-at { position: absolute; left: 8px; right: 8px; bottom: 100%; display: flex; flex-direction: column; padding: 4px; border-radius: 12px;
			background: #fff; box-shadow: 0 4px 16px rgba(120, 0, 70, .25); z-index: 3; }
		.sb-compose #sb-at button { width: auto; height: auto; display: flex; justify-content: flex-start; gap: 8px; padding: 4px 8px; border-radius: 8px;
			background: none; color: #6b2150; font-size: 13px; text-align: left; }
		.sb-compose #sb-at button.on { background: #ffe6f3; }
		#sb-ask .sb-pill.on { background: #ff4fa3; border-color: #ff4fa3; color: #fff; }
		html.sb-night #sb-at, html.sb-night .sb-replybar { background: #253064; color: #dfe6ff; }
		html.sb-night .sb-compose #sb-at button { color: #dfe6ff; }
		html.sb-night .sb-compose #sb-at button.on { background: #1c2450; }
		html.sb-night #sb-ask .sb-pill.on { background: #5b8cff; border-color: #5b8cff; }
		html.sb-themed #sb-at, html.sb-themed .sb-replybar { background: var(--sb-t-element); color: var(--sb-t-text); }
		html.sb-themed .sb-compose #sb-at button { color: var(--sb-t-text); }
		html.sb-themed .sb-compose #sb-at button.on, html.sb-themed #sb-ask .sb-pill.on { background: var(--sb-t-accent); color: var(--sb-t-text); }
		#sb-at .sb-av { width: 22px; height: 22px; font-size: 10px; }
		.sb-pinned { font-size: 10px; }
		#sb-ask .sb-menu-card { min-width: 220px; align-items: stretch; }
		#sb-ask .sb-quote { max-width: 260px; max-height: 90px; overflow: hidden; padding: 6px 10px; border-radius: 12px; background: #fff0f8; font-style: italic;
			white-space: pre-wrap; word-break: break-word; }
		.sb-b.them { align-self: flex-start; background: #fff; border: 1px solid #ffd1e8; border-bottom-left-radius: 6px; }
		.sb-b.me { align-self: flex-end; background: linear-gradient(135deg, #ff6fb5, #ff4fa3); color: #fff; border-bottom-right-radius: 6px; }
		.sb-b em { display: flex; align-items: center; font-style: normal; font-size: 10px; opacity: .7; margin-top: 2px; }
		.sb-b.me em { justify-content: flex-end; }
		.sb-b .sb-room { display: block; font-size: 11px; margin-top: 3px; opacity: .85; }
		.sb-emote { font-style: italic; opacity: .85; }
		.sb-link { color: inherit; text-decoration: underline; word-break: break-all; }
		.sb-embed { display: block; margin-top: 4px; }
		.sb-embed img { display: block; max-width: min(100%, ${EMBED_MAX.w}px); max-height: ${EMBED_MAX.h}px; width: auto; height: auto; border-radius: 10px; }
		.sb-asktrust { display: block; margin-top: 4px; font-size: 11px; white-space: normal; }
		.sb-asktrust .sb-pill { padding: 1px 8px; font-size: 11px; }
		.sb-msgwrap { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
		#sb-panel .sb-jump { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: none; align-items: center; gap: 4px;
			padding: 5px 12px 5px 14px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 8px #c2186b44; cursor: pointer; }
		#sb-panel .sb-jump.on { display: flex; }
		.sb-joincode { margin-left: 2px; padding: 1px 8px !important; font-size: 11px !important; }
		.sb-bcjoin { margin-left: 6px; padding: 1px 8px; border: 0; border-radius: 10px; background: #ff7ac0; color: #fff; font: bold 12px sans-serif; cursor: pointer; }
		.sb-bcjoin:hover { background: #e85aa6; }
		.sb-joinroom { margin-left: 4px; padding: 1px 8px !important; font-size: 11px !important; }
		#sb-me { display: flex; cursor: pointer; }
		/* Pictures in the window zoom when clicked; yours at the top opens ⚙ instead. */
		#sb-panel img.sb-pic { cursor: zoom-in; }
		#sb-panel #sb-me img.sb-pic { cursor: pointer; }
		#sb-zoom { position: absolute; inset: 0; z-index: 5; background: #0008; backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
		#sb-zoom img { width: 220px; height: 220px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 10px 40px #000a; background: #fff; }
		#sb-me .sb-av { width: 28px; height: 28px; border: 2px solid #fff; font-size: 11px; }
		#sb-crop, #sb-ask { position: absolute; inset: 0; z-index: 5; background: #fff8; backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; font-family: inherit; }
		#sb-crop .sb-crop-card, #sb-ask .sb-crop-card { background: #fff; color: #5a2a48; border-radius: 18px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 10px; box-shadow: 0 10px 40px #0008; max-width: calc(100% - 24px); }
		#sb-crop .sb-crop-ring { border-radius: 50%; overflow: hidden; border: 3px solid #ff7ac0; background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0 / 16px 16px; touch-action: none; }
		/* The game styles every canvas as its full-screen one (absolute, 100% wide); not this one. */
		#sb-crop canvas { display: block; cursor: grab; position: static; inset: auto; margin: 0; padding: 0; width: 200px !important; height: 200px !important; max-width: none; }
		#sb-crop canvas:active { cursor: grabbing; }
		#sb-crop input[type=range] { width: 200px; accent-color: #ff4fa3; }
		#sb-ask { align-items: flex-start; padding-top: 70px; }
		#sb-ask .sb-warn { background: #ffe1e1; color: #b00020; border: 2px solid #e5303f; border-radius: 12px; padding: 10px 12px; font-weight: 700; font-size: 13px; line-height: 1.35; text-align: center; }
		#sb-ask .sb-danger { background: #e5303f; }
		#sb-crop .sb-crop-btns, #sb-ask .sb-crop-btns { display: flex; gap: 8px; }
		#sb-crop .sb-crop-card { position: relative; }
		#sb-crop .sb-crop-x { position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border-radius: 50%; border: none; background: #ffe3f1; color: #c2387f; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
		.sb-b.sb-act { font-style: italic; background: transparent !important; border: 1px dashed currentColor !important; color: inherit; opacity: .85; }
		.sb-b.sb-wait { opacity: .7; border: 2px dashed #ffb3d9; }
		.sb-b.sb-wait a { color: inherit; text-decoration: underline; }
		#sb-emoji { position: absolute; left: 8px; right: 8px; bottom: 60px; z-index: 4; height: 210px; display: flex; flex-direction: column;
			background: #fff; border: 2px solid #ffd1e8; border-radius: 14px; box-shadow: 0 6px 20px #ff4fa333; overflow: hidden; }
		.sb-emo-tabs { display: flex; gap: 2px; padding: 4px; background: #ffe6f3; }
		.sb-emo-tabs button { border: none; background: transparent; border-radius: 8px; font-size: 17px; width: 34px; height: 30px; cursor: pointer; }
		.sb-emo-tabs button.on { background: #fff; box-shadow: 0 1px 4px #ff4fa344; }
		.sb-emo-tabs button[data-eclose] { margin-left: auto; font-size: 13px; color: #c08aaa; }
		.sb-emo-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(34px, 1fr)); padding: 4px; }
		.sb-emo-grid button { border: none; background: transparent; font-size: 21px; height: 36px; border-radius: 8px; cursor: pointer; }
		.sb-emo-grid button:hover { background: #ffe6f3; }
		html.sb-night #sb-emoji { background: #1a2142; border-color: #2f3b75; }
		html.sb-night .sb-emo-tabs { background: #1c2450; }
		html.sb-night .sb-emo-tabs button.on, html.sb-night .sb-emo-grid button:hover { background: #253064; }
		html.sb-themed #sb-emoji { background: var(--sb-t-main); border-color: var(--sb-t-element-hover); }
		html.sb-themed .sb-emo-tabs { background: var(--sb-t-element-disabled); }
		html.sb-themed .sb-emo-tabs button.on, html.sb-themed .sb-emo-grid button:hover { background: var(--sb-t-element); }
		.sb-cmd { display: flex; flex-direction: column; gap: 1px; font-size: 12px; padding: 4px 6px; border-radius: 8px; background: #fff3f9; text-align: left; }
		.sb-cmd code { font-weight: 700; color: #c2387f; }
		html.sb-night .sb-cmd { background: #1d2550; }
		.sb-compose { display: flex; gap: 6px; align-items: flex-end; padding: 8px; background: #ffe6f3; }
		.sb-compose textarea { flex: 1; height: 38px; max-height: 100px; resize: none; border: 2px solid #ffd1e8; border-radius: 16px;
			padding: 8px 10px; background: #fff; color: #4a2340; font: inherit; }
		.sb-compose button { border: none; width: 38px; height: 38px; border-radius: 50%; background: #ff4fa3; color: #fff; font-size: 16px; flex: none; }
		.sb-compose button.pin { background: #fff; color: #c08aaa; }
		.sb-compose button.pin.on { background: #9fe8ff; color: #1f6b80; }
		.sb-compose button:disabled { opacity: .45; cursor: default; }
		.sb-group textarea { width: 100%; height: 70px; resize: vertical; border: 2px solid #ffd1e8; border-radius: 14px; padding: 8px 10px;
			background: #fff; color: #4a2340; font: inherit; }
		.sb-group label { display: flex; align-items: center; padding: 5px 8px; margin: 3px 0; border-radius: 12px; background: #fff; cursor: pointer; }
		.sb-pill { border: none; border-radius: 12px; padding: 4px 12px; background: #fff; color: #ff4fa3; border: 1px solid #ffb3d9; }
		.sb-go { border: none; border-radius: 14px; padding: 7px 18px; background: #ff4fa3; color: #fff; font-weight: bold; box-shadow: 0 2px 6px #ff4fa366; }
		.sb-go:disabled { opacity: .45; cursor: default; }
		.sb-line { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin: 6px 0; }
		.sb-hint { color: #a0638a; font-size: 11px; }
		img.sb-pic { object-fit: cover; padding: 0; background: #fff; }
		.sb-gav { background: linear-gradient(135deg, #ffb3d9, #9fe8ff); font-size: 16px; }
		.sb-from { display: block; font-size: 11px; font-weight: bold; color: #c2186b; margin-bottom: 2px; }
		.sb-sys { align-self: center; font-size: 11px; color: #a0638a; background: #ffe6f3; padding: 2px 10px; border-radius: 10px; }
		.sb-thead > button#sb-leave { margin-left: auto; }
		.sb-thead > button#sb-mute { flex: none; font-size: 13px; }
		.sb-thead > button#sb-more { flex: none; }
		html.sb-night .sb-gav { background: linear-gradient(135deg, #4f6bd8, #7a5cd6); }
		html.sb-night .sb-from { color: #8fb3ff; }
		html.sb-night .sb-sys { background: #1d2550; color: #8f9fd6; }
		#sb-cards { position: fixed; z-index: 100000; width: 280px; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
		.sb-card { pointer-events: auto; display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 18px; cursor: pointer;
			background: #fff7fb; color: #4a2340; border: 2px solid #ffc2e2; box-shadow: 0 6px 20px #c2186b55; box-sizing: border-box;
			font: 13px "Trebuchet MS", "Segoe UI", sans-serif; text-align: left; line-height: 1.3; animation: sb-in .25s ease-out; }
		.sb-card.out { animation: sb-out .25s ease-in forwards; }
		.sb-card .sb-main { flex: 1; min-width: 0; }
		.sb-card .sb-main b { display: block; color: #c2186b; }
		.sb-card .sb-txt { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; word-break: break-word; }
		.sb-card small { display: block; color: #a0638a; font-size: 11px; margin-top: 2px; }
		.sb-card .sb-x { flex: none; border: none; background: none; color: #c08aaa; font-size: 14px; cursor: pointer; padding: 0 2px; }
		.sb-card.news { background: linear-gradient(120deg, #fff0f8, #eafbff); border-color: #9fe8ff; }
		@keyframes sb-in { from { opacity: 0; transform: translateY(10px) scale(.95); } }
		@keyframes sb-out { to { opacity: 0; transform: translateX(30px); } }
		/* Night mode (html.sb-night): navy colours and a blue slime. */
		html.sb-night #sb-toggle { background: #1a2142; border-color: #8fb3ff; box-shadow: 0 3px 12px #3b55c488; }
		html.sb-night #sb-toggle img, html.sb-night .sb-head > img, html.sb-night .sb-card.news > img { filter: hue-rotate(-105deg) saturate(1.15) brightness(.92); }
		html.sb-night #sb-badge { background: #5b8cff; border-color: #1a2142; }
		html.sb-night #sb-panel { background: #141a33; color: #dfe6ff; border-color: #2f3b75; box-shadow: 0 8px 30px #0008; color-scheme: dark; }
		html.sb-night .sb-head { background: linear-gradient(120deg, #2b3a8f, #4f6bd8 55%, #7a5cd6); text-shadow: 0 1px 2px #0008; }
		html.sb-night .sb-tabs, html.sb-night .sb-thead, html.sb-night .sb-compose { background: #1c2450; }
		html.sb-night .sb-tabs button { background: #253064; color: #a9c1ff; }
		html.sb-night .sb-tabs button.on { background: #5b8cff; color: #fff; box-shadow: 0 2px 6px #5b8cff66; }
		html.sb-night .sb-tabs button i { background: #5b8cff; }
		html.sb-night .sb-tabs button.on i { background: #fff; color: #3b55c4; }
		html.sb-night .sb-row, html.sb-night .sb-group label { background: #1d2550; border-color: #2c3866; color: #dfe6ff; }
		html.sb-night .sb-row:hover { background: #253064; border-color: #5b8cff; }
		html.sb-night .sb-sub, html.sb-night .sb-hint, html.sb-night .sb-side, html.sb-night .sb-empty { color: #8f9fd6; }
		html.sb-night .sb-dot { background: #5b8cff; }
		html.sb-night .sb-av { border-color: #141a33; }
		html.sb-night .sb-av:not(.sb-pic) { filter: saturate(.7) brightness(.85); }
		html.sb-night .sb-search, html.sb-night .sb-compose textarea, html.sb-night .sb-group textarea {
			background: #10152b; color: #dfe6ff; border-color: #2f3b75; }
		html.sb-night #sb-panel textarea:focus, html.sb-night #sb-panel input:focus { border-color: #5b8cff !important; box-shadow: 0 0 0 3px #2b3a8f; }
		html.sb-night .sb-msgs { background: radial-gradient(circle at 20% 10%, #1d2550 0, #141a33 60%); }
		html.sb-night .sb-b.them { background: #222b55; border-color: #2f3b75; color: #dfe6ff; }
		html.sb-night .sb-b.me { background: linear-gradient(135deg, #4f6bd8, #3b55c4); }
		html.sb-night .sb-compose button, html.sb-night .sb-go { background: #5b8cff; box-shadow: none; }
		html.sb-night .sb-compose button.pin { background: #253064; color: #8f9fd6; }
		html.sb-night .sb-compose button.pin.on { background: #7a5cd6; color: #fff; }
		html.sb-night .sb-thead button { background: #253064; color: #a9c1ff; }
		html.sb-night #sb-mu { background: #141a33; color: #dfe6ff; border-color: #2f3b75; box-shadow: 0 8px 30px #0008; color-scheme: dark; }
		html.sb-night .sb-mu-controls button, html.sb-night .sb-mu-add button { background: #253064; color: #a9c1ff; box-shadow: none; }
		html.sb-night .sb-mu-controls .sb-mu-big { background: linear-gradient(135deg, #4f6bd8, #3b55c4); color: #fff; }
		html.sb-night .sb-mu-controls .sb-mu-vol button { background: transparent; }
		html.sb-night .sb-mu-art { background: linear-gradient(135deg, #4f6bd8, #7a5cd6); }
		html.sb-night .sb-mu-status, html.sb-night .sb-mu-progress { color: #8f9fd6; }
		html.sb-night #sb-mu input[type=range] { accent-color: #5b8cff; }
		html.sb-night .sb-mu-more { border-color: #2c3866; }
		html.sb-night .sb-mu-row.on, html.sb-night .sb-jamline.on { background: #253064; }
		html.sb-night .sb-jamline { background: #1a2147; border-color: #2c3866; }
		html.sb-night .sb-mu-share.on { background: #5b8cff; color: #fff; }
		html.sb-night .sb-pill { background: #1d2550; color: #a9c1ff; border-color: #2f3b75; }
		html.sb-night #sb-crop, html.sb-night #sb-ask { background: #0008; }
		html.sb-night #sb-crop .sb-crop-card, html.sb-night #sb-ask .sb-crop-card { background: #1a2142; color: #dfe6ff; box-shadow: 0 0 0 1px #2f3b75, 0 10px 40px #000a; }
		html.sb-night #sb-crop .sb-crop-ring { border-color: #5b8cff; }
		html.sb-night #sb-crop .sb-crop-x { background: #253064; color: #a9c1ff; }
		html.sb-night #sb-crop input[type=range] { accent-color: #5b8cff; }
		html.sb-night #sb-ask .sb-warn { background: #3a1420; color: #ffb3bd; }
		html.sb-night #sb-ask .sb-quote { background: #1d2550; }
		html.sb-night .sb-tr-pick select { background: #141a33; border-color: #2f3b75; }
		html.sb-night #sb-panel input[type=checkbox] { accent-color: #5b8cff; }
		html.sb-night .sb-line[style] { background: #141a33 !important; }
		html.sb-night .sb-card { background: #1a2142; color: #dfe6ff; border-color: #2f3b75; box-shadow: 0 6px 20px #0008; }
		html.sb-night .sb-card .sb-main b { color: #8fb3ff; }
		html.sb-night .sb-card small, html.sb-night .sb-card .sb-x { color: #8f9fd6; }
		html.sb-night .sb-card.news { background: linear-gradient(120deg, #1a2142, #241f4f); border-color: #7a5cd6; }
		html.sb-night #sb-toast { background: #dfe6ff; color: #1a2142; box-shadow: 0 4px 14px #0008; }
		html.sb-night .sb-body::-webkit-scrollbar-thumb { background: #2f3b75; }
		/* Theme matching (html.sb-themed): a theme add-on's variables mapped onto --sb-t-*; after night mode so it wins. */
		html.sb-theme-themed body { --sb-t-main: var(--tmd-main); --sb-t-element: var(--tmd-element); --sb-t-element-hover: var(--tmd-element-hover);
			--sb-t-element-disabled: var(--tmd-element-disabled); --sb-t-accent: var(--tmd-accent); --sb-t-accent-hover: var(--tmd-accent-hover);
			--sb-t-accent-disabled: var(--tmd-accent-disabled); --sb-t-text: var(--tmd-text); --sb-t-text-disabled: var(--tmd-text-disabled); }
		html.sb-theme-bcneko body { --sb-t-main: var(--bcn-panel); --sb-t-element: var(--bcn-soft); --sb-t-element-hover: var(--bcn-border);
			--sb-t-element-disabled: var(--bcn-soft); --sb-t-accent: var(--bcn-accent); --sb-t-accent-hover: var(--bcn-accent);
			--sb-t-accent-disabled: var(--bcn-border); --sb-t-text: var(--bcn-text); --sb-t-text-disabled: var(--bcn-muted); }
		html.sb-themed #sb-toggle { background: var(--sb-t-element); border-color: var(--sb-t-accent); box-shadow: 0 3px 12px #0006; }
		html.sb-themed #sb-badge { background: var(--sb-t-accent); border-color: var(--sb-t-main); }
		html.sb-themed #sb-panel { background: var(--sb-t-main); color: var(--sb-t-text); border-color: var(--sb-t-element-hover); box-shadow: 0 8px 30px #0008; }
		html.sb-themed .sb-head { background: linear-gradient(120deg, var(--sb-t-accent), var(--sb-t-accent-hover)); color: var(--sb-t-text); text-shadow: 0 1px 2px #0008; }
		html.sb-themed .sb-head button { background: var(--sb-t-element); color: var(--sb-t-text); }
		html.sb-themed .sb-tabs, html.sb-themed .sb-thead, html.sb-themed .sb-compose { background: var(--sb-t-element-disabled); }
		html.sb-themed .sb-tabs button { background: var(--sb-t-element); color: var(--sb-t-text); }
		html.sb-themed .sb-tabs button.on { background: var(--sb-t-accent); color: var(--sb-t-text); box-shadow: none; }
		html.sb-themed .sb-tabs button i, html.sb-themed .sb-dot { background: var(--sb-t-accent-hover); color: var(--sb-t-text); }
		html.sb-themed .sb-tabs button.on i { background: var(--sb-t-text); color: var(--sb-t-accent); }
		html.sb-themed .sb-row, html.sb-themed .sb-group label { background: var(--sb-t-element); border-color: var(--sb-t-element-hover); color: var(--sb-t-text); }
		html.sb-themed .sb-row:hover { background: var(--sb-t-element-hover); border-color: var(--sb-t-accent); }
		html.sb-themed .sb-sub, html.sb-themed .sb-hint, html.sb-themed .sb-side, html.sb-themed .sb-empty { color: var(--sb-t-text-disabled); }
		html.sb-themed .sb-search, html.sb-themed .sb-compose textarea, html.sb-themed .sb-group textarea {
			background: var(--sb-t-main); color: var(--sb-t-text); border-color: var(--sb-t-element-hover); }
		html.sb-themed #sb-panel textarea:focus, html.sb-themed #sb-panel input:focus { border-color: var(--sb-t-accent) !important; box-shadow: 0 0 0 3px var(--sb-t-accent-disabled); }
		html.sb-themed .sb-msgs { background: var(--sb-t-main); }
		html.sb-themed .sb-b.them { background: var(--sb-t-element); border-color: var(--sb-t-element-hover); color: var(--sb-t-text); }
		html.sb-themed .sb-b.me { background: var(--sb-t-accent); color: var(--sb-t-text); }
		html.sb-themed .sb-from { color: var(--sb-t-accent-hover); }
		html.sb-themed .sb-sys { background: var(--sb-t-element); color: var(--sb-t-text-disabled); }
		html.sb-themed .sb-gav { background: var(--sb-t-accent); }
		html.sb-themed .sb-compose button, html.sb-themed .sb-go { background: var(--sb-t-accent); color: var(--sb-t-text); box-shadow: none; }
		html.sb-themed .sb-compose button.pin { background: var(--sb-t-element); color: var(--sb-t-text-disabled); }
		html.sb-themed .sb-compose button.pin.on { background: var(--sb-t-accent-hover); color: var(--sb-t-text); }
		html.sb-themed .sb-thead button { background: var(--sb-t-element); color: var(--sb-t-text); }
		html.sb-themed #sb-mu { background: var(--sb-t-main); color: var(--sb-t-text); border-color: var(--sb-t-element-hover); box-shadow: 0 8px 30px #0008; }
		html.sb-themed .sb-mu-controls button, html.sb-themed .sb-mu-add button { background: var(--sb-t-element); color: var(--sb-t-text); box-shadow: none; }
		html.sb-themed .sb-mu-controls .sb-mu-big, html.sb-themed .sb-mu-share.on, html.sb-themed .sb-mu-art { background: var(--sb-t-accent); color: var(--sb-t-text); }
		html.sb-themed .sb-mu-controls .sb-mu-vol button { background: transparent; }
		html.sb-themed .sb-mu-status, html.sb-themed .sb-mu-progress { color: var(--sb-t-text-disabled); }
		html.sb-themed #sb-mu input[type=range] { accent-color: var(--sb-t-accent); }
		html.sb-themed .sb-mu-more { border-color: var(--sb-t-element-hover); }
		html.sb-themed .sb-mu-row.on, html.sb-themed .sb-jamline.on { background: var(--sb-t-element-hover); }
		html.sb-themed .sb-jamline { background: var(--sb-t-element-disabled); border-color: var(--sb-t-element-hover); }
		html.sb-themed .sb-pill { background: var(--sb-t-element); color: var(--sb-t-text); border-color: var(--sb-t-element-hover); }
		html.sb-themed #sb-panel input[type=checkbox] { accent-color: var(--sb-t-accent); }
		html.sb-themed .sb-line[style] { background: var(--sb-t-main) !important; }
		html.sb-themed .sb-card { background: var(--sb-t-main); color: var(--sb-t-text); border-color: var(--sb-t-element-hover); box-shadow: 0 6px 20px #0008; }
		html.sb-themed .sb-card .sb-main b { color: var(--sb-t-accent-hover); }
		html.sb-themed .sb-card small, html.sb-themed .sb-card .sb-x { color: var(--sb-t-text-disabled); }
		html.sb-themed .sb-card.news { background: var(--sb-t-element); border-color: var(--sb-t-accent); }
		html.sb-themed #sb-toast { background: var(--sb-t-element); color: var(--sb-t-text); box-shadow: 0 4px 14px #0008; }
		html.sb-themed .sb-body::-webkit-scrollbar-thumb { background: var(--sb-t-element-hover); }
		#sb-toast { position: fixed; z-index: 100000; padding: 8px 14px; border-radius: 16px; background: #4a2340; color: #fff;
			font: bold 13px "Trebuchet MS", "Segoe UI", sans-serif; box-shadow: 0 4px 14px #c2186b66; pointer-events: none;
			opacity: 0; transform: translateY(6px); transition: opacity .2s, transform .2s; white-space: nowrap; }
		#sb-toast.show { opacity: 1; transform: none; }
		#sb-toggle.boing { animation: sb-boing .45s; }
		.toast.sb-toast { --background-color: #fff2f9; --accent-color: #7a2456; --progress-color: #ff4fa3; background: linear-gradient(135deg, #ffe3f1, #fff7fc); border: 2px solid #ff9ccf; border-radius: 16px; font-family: "Trebuchet MS", "Segoe UI", sans-serif; text-align: left; }
		.toast.sb-toast .progress-bar { background: transparent; }
		.toast.sb-toast .progress-bar::-webkit-progress-bar { background: transparent; }
		.toast.sb-toast .progress-bar::-webkit-progress-value { background: var(--progress-color); }
		.toast.sb-toast .progress-bar::-moz-progress-bar { background: var(--progress-color); }
		.toast.sb-toast .toast-icon { border-radius: 50%; box-shadow: 0 0 0 2px #fff, 0 0 0 3px #ff9ccf; }
		.toast.sb-toast .toast-title { color: #d6247f; }
		.toast.sb-toast[data-category="SlimeBeep-note"] { border-width: 1px; }
		.toast.sb-toast[data-category="SlimeBeep-crown"], .toast.sb-toast[data-category="SlimeBeep-ach"] { --progress-color: #e6b422; background: linear-gradient(135deg, #fff4c2, #ffe08a 45%, #ffd1ec); border-color: #e6b422; box-shadow: 0 0 18px #ffd23f99; }
		.toast.sb-toast[data-category="SlimeBeep-crown"] .toast-title, .toast.sb-toast[data-category="SlimeBeep-ach"] .toast-title { color: #a8740a; }
		html.sb-night .toast.sb-toast { --progress-color: #5b8cff; --background-color: #141a33; --accent-color: #dfe6ff; background: linear-gradient(135deg, #1d2550, #141a33); border-color: #5b8cff; }
		html.sb-night .toast.sb-toast .toast-title { color: #8fb3ff; }
		html.sb-night .toast.sb-toast[data-category="SlimeBeep-crown"], html.sb-night .toast.sb-toast[data-category="SlimeBeep-ach"] { --progress-color: #e6b422; background: linear-gradient(135deg, #3a2f0c, #1d2550); border-color: #e6b422; }
		html.sb-night .toast.sb-toast[data-category="SlimeBeep-crown"] .toast-title, html.sb-night .toast.sb-toast[data-category="SlimeBeep-ach"] .toast-title { color: #ffd23f; }
		html.sb-themed .toast.sb-toast { --progress-color: var(--sb-t-accent); --background-color: var(--sb-t-main); --accent-color: var(--sb-t-text); background: var(--sb-t-main); border-color: var(--sb-t-accent); }
		html.sb-themed .toast.sb-toast .toast-title { color: var(--sb-t-accent); }
		#sb-toggle.sb-crowned::before { content: '👑'; position: absolute; z-index: 1; left: 0; right: 0; top: -24px; text-align: center; font-size: 28px; line-height: 1; pointer-events: none; animation: sb-crown .6s ease-out; filter: drop-shadow(0 2px 2px #0005); }
		@keyframes sb-crown { from { transform: translateY(-30px) scale(.4); opacity: 0; } 70% { transform: translateY(3px) scale(1.15); opacity: 1; } }
		.sb-confetti { position: fixed; width: 0; height: 0; z-index: 100001; pointer-events: none; }
		.sb-confetti i { position: absolute; width: 7px; height: 11px; border-radius: 2px; opacity: 0; animation: sb-confetti 1.4s ease-out forwards; }
		@keyframes sb-confetti { 0% { transform: translate(0, 0) rotate(0); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(var(--dx), calc(var(--dy) + 140px)) rotate(var(--r)); opacity: 0; } }
		@keyframes sb-boing { 30% { transform: scale(1.25, .8); } 60% { transform: scale(.9, 1.15); } }
		.sb-head #sb-dnd.on, .sb-head #sb-afk.on { background: #fff; box-shadow: 0 0 0 2px #ff4fa3; }
	`;

	/** Creates the toggle, panel, toast and card stack, wires them up and starts the 1 s tick. */
	function build() {
		// Registered with the mod SDK for its mod list, and for the slime and version drawn above SlimeBeep users in a room.
		try {
			if (window.bcModSdk && typeof window.bcModSdk.registerMod === 'function') {
				const mod = window.bcModSdk.registerMod({
					name: 'SlimeBeep',
					fullName: 'SlimeBeep',
					version: VERSION,
					repository: 'https://github.com/Proudkiller0015/slimebeep',
				});
				if (mod && typeof mod.hookFunction === 'function') {
					mod.hookFunction('ChatRoomCharacterViewDrawOverlay', 0, (args, next) => {
						const r = next(args);
						drawBadge(args[0], args[1], args[2], args[3]);
						return r;
					});
				}
			}
		} catch (e) {
			warn(e, 'mod SDK');
		}
		const style = document.createElement('style');
		style.id = 'sb-style';
		style.textContent = css;
		document.head.appendChild(style);

		const toggle = document.createElement('button');
		toggle.id = 'sb-toggle';
		toggle.title = 'SlimeBeep (drag to move)';
		setHtml(toggle, html`<img src="${ICON}" alt="SlimeBeep"><span id="sb-badge"></span>`);
		document.body.appendChild(toggle);
		const toast = document.createElement('div');
		toast.id = 'sb-toast';
		document.body.appendChild(toast);
		const cards = document.createElement('div');
		cards.id = 'sb-cards';
		document.body.appendChild(cards);

		const panel = document.createElement('div');
		panel.id = 'sb-panel';
		setHtml(
			panel,
			html`
			<div class="sb-head">
				<img src="${ICON}" alt="">
				<b>SlimeBeep <small>v${VERSION}</small></b>
				<span id="sb-me"></span>
				<button id="sb-music" title="Music player">🎵</button>
				<button id="sb-moon" title="Night mode">🌙</button>
				<button id="sb-gear" title="Settings">${ICONS.gear}</button>
				<button id="sb-afk"></button>
				<button id="sb-dnd"></button>
				<button id="sb-close" title="Close">${ICONS.close}</button>
			</div>
			<div id="sb-view" style="flex:1;display:flex;flex-direction:column;min-height:0"></div>
			${['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].map((d) => html`<div class="sb-rs" data-rs="${d}" title="Drag to resize (double-click: usual size)"></div>`)}`,
		);
		document.body.appendChild(panel);
		wireWindow(panel);
		buildMusic();
		$('sb-music').addEventListener('click', () => openMusic(!$('sb-mu').classList.contains('on')));

		/** @type {{ dx: number, dy: number, x0: number, y0: number, lastX: number, lastY: number, moved: boolean } | null} Toggle drag in progress: pointer offset, start point, last point, whether it moved. */
		let drag = null;
		/**
		 * Ends a drag (saving the position when `save`).
		 * @param {boolean} save
		 * @returns {boolean} whether it was a move rather than a click
		 */
		const endDrag = (save) => {
			if (!drag) {
				return false;
			}
			const moved = drag.moved;
			drag = null;
			toggle.classList.remove('dragging');
			if (moved && save) {
				saveOpts();
			}
			return moved;
		};
		toggle.addEventListener('pointerdown', (e) => {
			if (e.button !== 0) {
				return;
			}
			const r = toggle.getBoundingClientRect();
			drag = {
				dx: e.clientX - r.left,
				dy: e.clientY - r.top,
				x0: e.clientX,
				y0: e.clientY,
				lastX: e.clientX,
				lastY: e.clientY,
				moved: false,
			};
			try {
				toggle.setPointerCapture(e.pointerId);
			} catch (err) {
				/* works without capture */
			}
		});
		toggle.addEventListener('pointermove', (e) => {
			if (!drag) {
				return;
			}
			// The release was lost (another window took it): stop instead of following the pointer.
			if (!(e.buttons & 1)) {
				endDrag(true);
				return;
			}
			// Outside the window some browsers report the pointer far off, even wrapped around to the other
			// edge: the pointer is kept inside the window, and a jump of half the window is no real move.
			const x = Math.max(0, Math.min(innerWidth, e.clientX));
			const y = Math.max(0, Math.min(innerHeight, e.clientY));
			if (Math.abs(x - drag.lastX) > innerWidth / 2 || Math.abs(y - drag.lastY) > innerHeight / 2) {
				return;
			}
			drag.lastX = x;
			drag.lastY = y;
			if (!drag.moved && Math.hypot(x - drag.x0, y - drag.y0) < 8) {
				return;
			}
			if (!drag.moved && isOpen() && !opts.win) {
				const pr = panel.getBoundingClientRect();
				opts.win = { x: Math.round(pr.left), y: Math.round(pr.top), w: Math.round(pr.width), h: Math.round(pr.height) };
			}
			drag.moved = true;
			toggle.classList.add('dragging');
			opts.pos = { x: (x - drag.dx) / innerWidth, y: (y - drag.dy) / innerHeight };
			place();
		});
		toggle.addEventListener('pointerup', (e) => {
			if (!drag || e.button !== 0) {
				return;
			}
			if (endDrag(true)) {
				return;
			}
			setOpen(panel.style.display !== 'flex');
			countCrownClick();
		});
		toggle.addEventListener('pointercancel', () => endDrag(true));
		toggle.addEventListener('lostpointercapture', () => endDrag(true));
		addEventListener('blur', () => endDrag(true));
		addEventListener('resize', place);
		$('sb-dnd').addEventListener('click', () => {
			setDnd(!opts.dnd);
			notify(opts.dnd ? '🔕 Do not disturb: no sounds or pop-ups until you turn it off' : '🔔 Sounds and pop-ups are back');
		});
		setDnd(opts.dnd);
		$('sb-afk').addEventListener('click', () => {
			if (opts.afk) {
				setAfk(false);
				notify('👋 Welcome back: auto-reply is off');
			} else {
				openAfk();
			}
		});
		setAfk(opts.afk);
		$('sb-close').addEventListener('click', () => setOpen(false));
		$('sb-moon').addEventListener('click', () => setNight(!opts.night));
		setNight(opts.night);
		$('sb-gear').addEventListener('click', openSettings);
		// Join buttons on group codes inside messages.
		panel.addEventListener(
			'click',
			(e) => {
				const join = targetOf(e).closest('button.sb-joincode');
				if (join instanceof HTMLElement) {
					e.preventDefault();
					e.stopPropagation();
					joinCode(join.dataset.code || '', openJoined);
				}
			},
			true,
		);
		// A click on a picture zooms it instead of opening the row it is in.
		panel.addEventListener(
			'click',
			(e) => {
				const img = targetOf(e).closest('img.sb-pic');
				if (!(img instanceof HTMLImageElement) || img.closest('#sb-me')) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				zoomPic(img.src);
			},
			true,
		);
		$('sb-me').addEventListener('click', () => {
			if (loggedIn()) {
				openStatus();
			}
		});
		// Keys typed in the panel stay out of the game's key handlers.
		panel.addEventListener('keydown', (e) => {
			e.stopPropagation();
			// Esc closes the emoji picker, then the window (pictures and dialogs catch it first).
			if (e.key === 'Escape') {
				if ($('sb-emoji')) {
					closeEmoji();
				} else {
					setOpen(false);
				}
			}
		});
		panel.addEventListener(
			'pointerdown',
			() => {
				lastPanelTouch = Date.now();
				panelActive = true;
			},
			true,
		);
		// A friend's 🏆 shows their achievements (before the row under it opens their chat).
		panel.addEventListener(
			'click',
			(e) => {
				const b = /** @type {HTMLElement | null} */ (targetOf(e).closest('[data-ach]'));
				if (b) {
					e.stopPropagation();
					openAchievements(Number(b.dataset.ach));
				}
			},
			true,
		);
		addEventListener('pointerdown', leavePanel, true);
		addEventListener('keydown', escAfterClick);
		addEventListener('keydown', konamiKey, true);
		hookLscg();
		toggle.addEventListener(
			'pointerdown',
			() => {
				lastPanelTouch = Date.now();
			},
			true,
		);

		if (loggedIn()) {
			listen();
		}
		place();
		setInterval(tick, 1000);
		news();
		registerSettings();
	}

	/** @type {BcSocket | null} The ServerSocket our listeners are attached to (see listen). */
	let listening = null;
	/** @type {{ at: string, from: number, type: string, text: string | null }[]} The last 20 beeps received, for SlimeBeep.debug(). */
	const seenBeeps = [];
	/**
	 * A beep as the server sends it (AccountBeep).
	 * @typedef {object} ServerBeep
	 * @property {number} MemberNumber the sender
	 * @property {string} MemberName
	 * @property {string} [BeepType] '' for a plain beep; PROTO for SlimeBeep's hidden ones; other add-ons use their own
	 * @property {string} [Message]
	 * @property {string} [ChatRoomName] the sender's room, when they shared it
	 * @property {string} [ChatRoomSpace]
	 * @property {boolean} [Private]
	 */
	/**
	 * Handles the server messages SlimeBeep reads: AccountBeep, the OnlineFriends answer and whispers to you
	 * (ChatRoomMessage). Others are ignored.
	 * @param {string} event
	 * @param {unknown} data
	 */
	function onServer(event, data) {
		try {
			if (event === 'ChatRoomMessage') {
				const m = /** @type {{ Type?: string, Sender?: number, Content?: unknown, Dictionary?: unknown } | null} */ (data);
				if (m && m.Type === 'Whisper' && isNum(m.Sender)) {
					takeWhisper(Number(m.Sender), m.Content, false);
				}
				if (m && m.Type === 'Hidden' && m.Content === ROOM_HELLO && isNum(m.Sender)) {
					takeHello(Number(m.Sender), m.Dictionary);
				}
				if (m && m.Type === 'Activity') {
					drinkNews(m);
				}
				if (m && m.Type === 'Action') {
					slimeNews(m);
				}
				return;
			}
			if (event === 'AccountQueryResult') {
				const answer = /** @type {{ Query?: string, Result?: Friend[] } | null} */ (data);
				if (!answer || answer.Query !== 'OnlineFriends' || !Array.isArray(answer.Result)) {
					return;
				}
				friends = answer.Result.filter((f) => f && f.MemberNumber !== Player.MemberNumber);
				friendsKnown = true;
				sendWaiting();
				if (isOpen() && tab !== 'chats') {
					render(true);
				}
			} else if (event === 'AccountBeep') {
				if (!data || typeof data !== 'object') {
					return;
				}
				const beepData = /** @type {ServerBeep} */ (data);
				// Copied before the game or another add-on changes it.
				/** @type {ServerBeep} */
				const d = {
					MemberNumber: beepData.MemberNumber,
					MemberName: beepData.MemberName,
					BeepType: beepData.BeepType,
					Message: beepData.Message,
					ChatRoomName: beepData.ChatRoomName,
					ChatRoomSpace: beepData.ChatRoomSpace,
					Private: beepData.Private,
				};
				seenBeeps.push({
					at: new Date().toISOString(),
					from: d.MemberNumber,
					type: d.BeepType || '',
					text: typeof d.Message === 'string' ? d.Message.slice(0, 80) : null,
				});
				if (seenBeeps.length > 20) {
					seenBeeps.shift();
				}
				if (d.BeepType === PROTO) {
					onHidden(d);
				} else {
					catchBeep(d);
				}
			}
		} catch (e) {
			warn(e);
		}
	}
	/** Content of the hidden room message SlimeBeeps greet each other with: Dictionary [{ slimeBeep: version, reply? }]. */
	const ROOM_HELLO = 'SlimeBeep';
	/** @type {Map<number, string>} Member number -> SlimeBeep version, for people met in a chat room. */
	const roomVersions = new Map();
	/** The room SlimeBeep last said hello in. */
	let helloRoom = '';
	/** Member number -> when we last answered their hello. */
	const helloAnswered = new Map();
	/**
	 * Says hello to the room (hidden), or answers one person's hello; SlimeBeeps answer with their version.
	 * @param {number} [to] answers this member only
	 */
	function sendHello(to) {
		try {
			ServerSend('ChatRoomChat', {
				Content: ROOM_HELLO,
				Type: 'Hidden',
				...(to ? { Target: to } : {}),
				Dictionary: [{ slimeBeep: VERSION, ...(to ? {} : { reply: true }) }],
			});
		} catch (e) {
			warn(e, 'hello');
		}
	}
	/** Says hello once per room you enter, so the SlimeBeeps there answer and show their badge. */
	function helloTick() {
		const room = ServerPlayerIsInChatRoom() ? myRoom() || '' : '';
		if (room !== helloRoom) {
			helloRoom = room;
			if (room) {
				sendHello();
			}
		}
	}
	/**
	 * A hidden hello from another SlimeBeep in the room: remembers its version, and answers (at most every 10 s each).
	 * @param {number} from
	 * @param {unknown} dict
	 */
	function takeHello(from, dict) {
		const d = Array.isArray(dict) ? dict[0] : null;
		const v = d && typeof d === 'object' ? d.slimeBeep : null;
		if (from === Player.MemberNumber || typeof v !== 'string' || !/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v)) {
			return;
		}
		roomVersions.set(from, v);
		if (d.reply === true && Date.now() - (helloAnswered.get(from) || 0) > 10000) {
			helloAnswered.set(from, Date.now());
			sendHello(from);
		}
	}
	/**
	 * Draws the slime above a SlimeBeep user in the room (and you), and its version while the mouse is on it, unless
	 * the room hides icons or the settings hide that badge.
	 * @param {{ MemberNumber?: number } | undefined} C
	 * @param {number} x
	 * @param {number} y
	 * @param {number} zoom
	 */
	function drawBadge(C, x, y, zoom) {
		try {
			if (!C || !isNum(C.MemberNumber) || (typeof ChatRoomHideIconState === 'number' && ChatRoomHideIconState > 0)) {
				return;
			}
			const me = C.MemberNumber === Player.MemberNumber;
			if (opts.badges === 'none' || (me && opts.badges === 'others')) {
				return;
			}
			const v = me ? VERSION : roomVersions.get(C.MemberNumber);
			if (!v) {
				return;
			}
			DrawImageResize(ICON, x + 330 * zoom, y + 42 * zoom, 34 * zoom, 34 * zoom);
			// The version only while the mouse is on the slime, like other add-ons' marks.
			if (typeof MouseIn === 'function' && MouseIn(x + 330 * zoom, y + 42 * zoom, 34 * zoom, 34 * zoom)) {
				DrawTextFit(v, x + 400 * zoom, y + 60 * zoom, 66 * zoom, '#ff8fc8', 'black');
			}
		} catch (e) {
			warn(e, 'badge');
		}
	}
	/**
	 * Catch-all socket listener; onServer keeps only AccountBeep and AccountQueryResult.
	 * @param {string} event
	 * @param {unknown} data
	 */
	const anyListener = (event, data) => onServer(event, data);
	/**
	 * Watches what the game sends, for your whispers (ChatRoomChat of type Whisper).
	 * @param {string} event
	 * @param {unknown} data
	 */
	const outListener = (event, data) => {
		try {
			const m = /** @type {{ Type?: string, Target?: number, Content?: unknown } | null} */ (data);
			if (event === 'ChatRoomChat' && m && m.Type === 'Whisper' && isNum(m.Target)) {
				takeWhisper(Number(m.Target), m.Content, true);
			}
			const b = /** @type {{ BeepType?: string, Message?: unknown } | null} */ (data);
			if (event === 'ChatRoomChat' && m) {
				konamiText(m.Content);
			} else if (event === 'AccountBeep' && b && !b.BeepType) {
				konamiText(b.Message);
			}
		} catch (e) {
			warn(e, 'whisper');
		}
	};
	/**
	 * Adds a chat room whisper to that person's chat. It also shows in the room's chat, so there is no
	 * sound, card or unread badge for it.
	 * @param {number} other who it was with
	 * @param {unknown} content
	 * @param {boolean} sent
	 */
	function takeWhisper(other, content, sent) {
		const text = typeof content === 'string' ? content.trim().slice(0, 1000) : '';
		if (!text || other === Player.MemberNumber) {
			return;
		}
		const now = Date.now();
		const k = `w:${other}|${sent ? 1 : 0}|${now}|${text.slice(0, 40)}`;
		if (histKeys.has(k)) {
			return;
		}
		const C =
			typeof ChatRoomCharacter === 'object' && Array.isArray(ChatRoomCharacter)
				? ChatRoomCharacter.find((c) => c.MemberNumber === other)
				: undefined;
		const name = nameOf(other) || (C && clean(C.Nickname || C.Name, LIMITS.name)) || `#${other}`;
		hist.push({
			k,
			MemberNumber: other,
			MemberName: name,
			Sent: sent,
			Time: now,
			Message: text,
			whisper: true,
		});
		histKeys.add(k);
		saveHistory();
		if (!sent) {
			afkReply(other, text, true);
		}
		if (isOpen() && tab !== 'wave') {
			render(true);
		}
	}
	/**
	 * Per-event listener, for a socket without a catch-all.
	 * @param {unknown} data
	 */
	const beepListener = (data) => onServer('AccountBeep', data);
	/**
	 * Per-event listener, for a socket without a catch-all.
	 * @param {unknown} data
	 */
	const queryListener = (data) => onServer('AccountQueryResult', data);
	/**
	 * Whether our listener is still attached to `sock` (true when the socket can't tell).
	 * @param {BcSocket} sock
	 * @param {boolean} catchAll whether we listen with the catch-all
	 */
	function stillListening(sock, catchAll) {
		if (catchAll) {
			return sock.listenersAny ? sock.listenersAny().includes(anyListener) : true;
		}
		return sock.listeners ? sock.listeners('AccountBeep').includes(beepListener) : true;
	}
	/**
	 * Attaches the listeners to ServerSocket (called every tick, re-attaching if they were removed).
	 * The catch-all goes first (prependAny) so a beep is read before another add-on can remove the
	 * game's listener for it or change it; it survives other code removing per-event listeners.
	 */
	function listen() {
		if (!loggedIn() || !ServerSocket || typeof ServerSocket.on !== 'function') {
			return;
		}
		const sock = ServerSocket;
		const catchAll = sock.prependAny || sock.onAny;
		if (listening === sock && stillListening(sock, !!catchAll)) {
			return;
		}
		listening = sock;
		if (sock.onAnyOutgoing) {
			if (sock.offAnyOutgoing) {
				sock.offAnyOutgoing(outListener);
			}
			sock.onAnyOutgoing(outListener);
		}
		if (catchAll) {
			if (sock.offAny) {
				sock.offAny(anyListener);
			}
			catchAll.call(sock, anyListener);
		} else {
			if (typeof sock.off === 'function') {
				sock.off('AccountBeep', beepListener);
				sock.off('AccountQueryResult', queryListener);
			}
			sock.on('AccountBeep', beepListener);
			sock.on('AccountQueryResult', queryListener);
		}
	}
	/** @typedef {'group' | 'groupGone' | 'presence' | 'slimeBeepFriend'} ApiEvent */
	/** @type {Record<ApiEvent, Set<(data: unknown) => void>>} Other add-ons' listeners for api.on(), by event. */
	const apiListeners = { group: new Set(), groupGone: new Set(), presence: new Set(), slimeBeepFriend: new Set() };
	/**
	 * Calls an api.on() event's listeners, each with its own copy of `data`.
	 * @param {ApiEvent} type
	 * @param {object} data
	 */
	function emit(type, data) {
		for (const fn of apiListeners[type]) {
			try {
				fn(JSON.parse(JSON.stringify(data)));
			} catch (e) {
				warn(e, `another add-on's ${type} listener`);
			}
		}
	}
	/**
	 * A member's role in a group.
	 * @param {Group} g
	 * @param {number} n
	 * @returns {'owner' | 'admin' | 'member'}
	 */
	function roleOf(g, n) {
		if (n === g.owner) {
			return 'owner';
		}
		return g.admins.includes(n) ? 'admin' : 'member';
	}
	/**
	 * A group as the API hands it out (see API.md).
	 * @param {Group} g
	 */
	function groupView(g) {
		const me = loggedIn() ? Player.MemberNumber : 0;
		const online = new Set([...(g.online || []), me]);
		return {
			id: g.id,
			name: g.name,
			owner: g.owner,
			admins: [...g.admins],
			anyoneCanInvite: !!g.open,
			canInvite: canInvite(g, me) && g.members.length < LIMITS.members,
			members: g.members.map((m) => ({
				memberNumber: m.n,
				name: m.n === me ? myName() : m.name,
				online: online.has(m.n),
				role: roleOf(g, m.n),
			})),
			picture: g.pic || null,
		};
	}
	/**
	 * The API for other add-ons, documented in API.md. Read-only: everything returned is a copy, and
	 * message text is never exposed. apiVersion changes only on a breaking change.
	 */
	window.SlimeBeep.api = Object.freeze({
		apiVersion: 1,
		version: VERSION,
		/** Your group chats, as groupView. */
		groups: () => (loggedIn() ? Object.values(groups).map(groupView) : []),
		/**
		 * One group by id, or null.
		 * @param {string} id
		 */
		group: (id) => (loggedIn() && groups[id] ? groupView(groups[id]) : null),
		/** The member numbers of friends known to have SlimeBeep. */
		slimeBeepFriends: () => [...peers],
		/**
		 * Whether this member number is a friend known to have SlimeBeep.
		 * @param {number} memberNumber
		 */
		hasSlimeBeep: (memberNumber) => peers.has(memberNumber),
		/**
		 * Opens SlimeBeep on a group chat.
		 * @param {string} id
		 */
		openGroup: (id) => {
			if (!groups[id]) {
				return false;
			}
			tab = 'groups';
			thread = `g:${id}`;
			if (!isOpen()) {
				setOpen(true);
			} else {
				render();
			}
			return true;
		},
		/**
		 * Invites someone to a group (see inviteToGroup).
		 * @param {string} id
		 * @param {number} memberNumber
		 */
		inviteToGroup: (id, memberNumber) => inviteToGroup(id, memberNumber),
		/**
		 * Opens SlimeBeep on "Invite <them> to…", listing the groups you can invite to.
		 * @param {number} memberNumber
		 */
		openInvite: (memberNumber) => {
			if (!isNum(memberNumber)) {
				return false;
			}
			inviteFor = { n: memberNumber, results: {} };
			thread = null;
			tab = 'invitefor';
			if (!isOpen()) {
				setOpen(true);
			} else {
				render();
			}
			return true;
		},
		/**
		 * For theme add-ons: SlimeBeep takes the running theme add-on's colours (true) or its own (false). Off unless switched on.
		 * @param {boolean} on
		 */
		matchTheme: (on) => {
			setThemed(!!on);
			return !!applyThemed();
		},
		/** { on, source }: whether SlimeBeep matches a theme add-on, and which one it found ('Themed', 'BCNeko' or null). */
		matchingTheme: () => ({ on: !!opts.themed, source: themeSource()?.name || null }),
		/**
		 * Opens SlimeBeep on a chat with this member number.
		 * @param {number} memberNumber
		 */
		openChat: (memberNumber) => {
			if (!isNum(memberNumber)) {
				return false;
			}
			thread = memberNumber;
			if (!isOpen()) {
				setOpen(true);
			} else {
				render();
			}
			return true;
		},
		/** Opens SlimeBeep's page in the game's Settings > Extensions. */
		openSettings: () => {
			openSettings();
		},
		/** Whether Do not disturb is on (no SlimeBeep sounds, pop-ups or desktop notifications). */
		doNotDisturb: () => !!opts.dnd,
		/**
		 * Turns Do not disturb on or off; returns whether it is on.
		 * @param {boolean} on
		 */
		setDoNotDisturb: (on) => {
			setDnd(!!on);
			return !!opts.dnd;
		},
		/**
		 * The song in SlimeBeep's music player, or null: title, link, whether it is a YouTube video, playing or
		 * paused, seconds in and length (0 until known), and who you listen along with or which chat you share it with.
		 */
		nowPlaying: () => {
			if (!music) {
				return null;
			}
			const j = following ? jams.get(following) : undefined;
			return {
				title: music.track.title,
				url: music.track.url,
				youtube: !!music.track.yt,
				playing: music.playing,
				position: Math.round(musicPos()),
				duration: Math.round(music.dur),
				listeningAlongWith: j ? j.hostName : null,
				sharedIn: sharing ? chatLabel(sharing) : null,
			};
		},
		/**
		 * Plays a YouTube or sound file link in the player, for this player only (nothing is shared); returns
		 * false if it isn't a song link.
		 * @param {string} link
		 */
		playSong: (link) => {
			if (typeof link !== 'string' || !trackOf(link)) {
				return false;
			}
			playLink(link);
			openMusic(true);
			return true;
		},
		/**
		 * on('group' | 'groupGone' | 'presence' | 'slimeBeepFriend', fn): fn gets a copy each time; returns a function that stops it.
		 * group: a group was joined or changed (a group, as in groups()); groupGone: { id }; presence: a group whose
		 * online members changed; slimeBeepFriend: { memberNumber } of a friend just found to have SlimeBeep.
		 * @param {string} type
		 * @param {(data: unknown) => void} fn
		 * @returns {() => void}
		 */
		on: (type, fn) => {
			if (!(type in apiListeners) || typeof fn !== 'function') {
				return () => {};
			}
			const set = apiListeners[/** @type {ApiEvent} */ (type)];
			set.add(fn);
			return () => {
				set.delete(fn);
			};
		},
	});

	/** State for bug reports, typed in the console. */
	window.SlimeBeep.debug = () => ({
		version: VERSION,
		missing: missing().map(([k]) => k),
		listening: !!listening,
		catchAll: !!(listening && (listening.prependAny || listening.onAny)),
		lastBeeps: seenBeeps.slice(),
	});

	/** @type {Map<number, number[]>} Member number -> times of their recent hidden beeps (see allow). */
	const hiddenBeepTimes = new Map();
	/**
	 * Whether a hidden beep from `n` is accepted: at most LIMITS.perMinute a minute.
	 * @param {number} n
	 */
	function allow(n) {
		const now = Date.now();
		const list = (hiddenBeepTimes.get(n) || []).filter((t) => now - t < 60000);
		list.push(now);
		hiddenBeepTimes.set(n, list);
		return list.length <= LIMITS.perMinute;
	}
	/** Member number -> when we last answered their ping. */
	const ponged = new Map();
	/**
	 * A status as SlimeBeep friends and groups see it.
	 * @typedef {object} Status
	 * @property {string} t a short line of their own
	 * @property {string} l the song they listen to; '' for none
	 * @property {string[]} a the ids of their achievements
	 */
	/**
	 * An achievement: id (two letters, since every status carries them), emoji, name, how to get it (a secret
	 * one never says), and whether its name stays hidden until unlocked.
	 * @typedef {[string, string, string, string, boolean]} Achievement
	 */
	/** @type {Achievement[]} */
	const ACHIEVEMENTS = [
		['sl', '🫧', 'Slimed!', 'Put Slime on someone', false],
		['sb', '🟢', 'Slime Bath', 'Cover someone in Slime in 4 places', false],
		['ra', '👑', 'Royal Audience', 'Spend 5 minutes in a room with the Slime Queen', false],
		['rs', '💚', 'Slimed by Royalty', 'Get Slime from the Slime Queen herself', false],
		['fb', '💌', 'First Beep', 'Send a beep with SlimeBeep', false],
		['ps', '👥', 'Party Starter', 'Make a group chat', false],
		['bw', '🌊', 'Big Wave', 'WaveBeep 10 friends at once', false],
		['gu', '🎨', 'Glow Up', 'Choose a profile picture', false],
		['st', '💬', "What's Up", 'Set a status', false],
		['js', '🎧', 'Jam Session', 'Listen along with someone', false],
		['dj', '🎶', 'DJ', 'Have 3 people listen along to your music at once', false],
		['rl', '🎵', 'Request Line', "Hear a song you added play in someone else's listen-along", false],
		['ah', '👑', 'All Hail', 'Secret achievement', true],
		['no', '🌙', 'Night Owl', 'Secret achievement', true],
		['lq', '✨', 'Long Live the Queen', 'Secret achievement', true],
		['aq', '🕹️', 'Arcade Queen', 'Enter the Konami code', true],
		['vc', '🐰', 'The Cabaret', 'Join a Velvet Cabaret room', false],
		['cd', '🍹', 'Care for a Drink?', 'Drink any beverage', false],
		['tr', '🍪', 'A Treat for the Road', 'Eat any food', false],
		['cw', '⚔️', 'The Chosen Weapon', 'Hold a scythe', false],
		['em', '🪄', 'The Era of Magic', 'Cast any LSCG spell', false],
		['se', '🔒', 'Secured', 'Have every item slot used', false],
		['rc', '🧸', 'Marketable Queen', 'Hold the Slime Queen Samantha plushie', false],
	];
	/** Whether an add-on is loaded, by its ModSDK name. */
	const hasMod = (/** @type {string} */ name) => {
		try {
			const sdk = window.bcModSdk;
			return !!sdk && typeof sdk.getModsInfo === 'function' && sdk.getModsInfo().some((m) => m.name === name);
		} catch (e) {
			return false;
		}
	};
	/**
	 * Echo's Clothing Mod foods: eating one is wearing it in a mouth slot (it has no "eat" activity). Cake roll,
	 * lollipop, grilled fish, chicken leg, fried bun, cookie, toast, egg tart, mooncake; the burger sits on the hood slot.
	 */
	const ECHO_FOODS = ['蛋糕卷', '棒棒糖', '烤鱼', '鸡腿', '煎包', '曲奇', '吐司', '蛋挞', '月饼', '汉堡'];
	/** @type {Record<string, string>} Achievements for another add-on's things: listed only with it loaded (or once got). */
	const MOD_ONLY = { cw: '服装拓展', em: 'LSCG' };
	/** Seconds in a room with the Slime Queen for Royal Audience. */
	const ROYAL_SECONDS = 300;
	/** Members the Slime Queen gave Long Live the Queen to. */
	const QUEEN_GIFTS = [217488];
	/** The nickname that unlocks All Hail (any case). */
	const QUEEN_NAME = 'slime queen samantha';
	/** The Konami code as keys (KeyboardEvent.key, lower case). */
	const KONAMI_KEYS = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
	/** @type {string[]} The last keys pressed, for the Konami code. */
	const konamiKeys = [];
	/**
	 * Whether a message spells out the Konami code, for players without arrow keys: "up up down down left
	 * right left right b a", "↑↑↓↓←→←→BA" or "uuddlrlrba", with or without spaces, commas and a "start".
	 * @param {unknown} text
	 */
	function isKonami(text) {
		if (typeof text !== 'string' || text.length > 200) {
			return false;
		}
		const t = text
			.toLowerCase()
			.replace(/↑/g, 'u')
			.replace(/↓/g, 'd')
			.replace(/←/g, 'l')
			.replace(/→/g, 'r')
			.replace(/up/g, 'u')
			.replace(/down/g, 'd')
			.replace(/left/g, 'l')
			.replace(/right/g, 'r')
			.replace(/[^a-z]/g, '');
		return t.includes('uuddlrlrba');
	}
	/**
	 * LSCG's extension API (LSCG_OnLoad): casting any spell unlocks The Era of Magic. The callback may run
	 * again when a player ticks SlimeBeep back on in LSCG's list, and older LSCG versions have no API at all.
	 */
	function hookLscg() {
		const w = /** @type {any} */ (window);
		(w.LSCG_OnLoad = w.LSCG_OnLoad || []).push((/** @type {any} */ lscg) => {
			if (!lscg || typeof lscg.getModApi !== 'function') {
				return;
			}
			try {
				const api = lscg.getModApi({ id: 'slimebeep', name: 'SlimeBeep', version: VERSION });
				api.events.on('spell.cast', () => unlock('em'));
			} catch (e) {
				// Turned off in LSCG's list, or registered already.
			}
		});
	}
	/**
	 * A key press: the Konami code (↑↑↓↓←→←→BA) unlocks Arcade Queen.
	 * @param {KeyboardEvent} e
	 */
	function konamiKey(e) {
		if (!e.key || e.repeat) {
			return;
		}
		konamiKeys.push(e.key.toLowerCase());
		if (konamiKeys.length > KONAMI_KEYS.length) {
			konamiKeys.shift();
		}
		if (konamiKeys.join() === KONAMI_KEYS.join()) {
			konamiKeys.length = 0;
			unlock('aq');
		}
	}
	/**
	 * Something you wrote (a beep, a whisper, the room chat or a group message): the Konami code written out
	 * unlocks Arcade Queen too.
	 * @param {unknown} text
	 */
	function konamiText(text) {
		if (isKonami(text)) {
			unlock('aq');
		}
	}
	/**
	 * Your achievements, for the account logged in.
	 * @typedef {object} Achievements
	 * @property {number} owner the account they belong to
	 * @property {Record<string, number>} got achievement id -> Date.now() when unlocked
	 * @property {number} royal seconds spent in a room with the Slime Queen so far
	 */
	/** @type {Achievements | null} */
	let ach = null;
	/** Longest part of a status. */
	const STATUS_MAX = 60;
	/** Ms a changed status waits before it goes out (songs skipped in a row, typing). */
	const STATUS_SETTLE = 5000;
	/** Most SlimeBeep friends told at once that your status changed. */
	const STATUS_FRIENDS = 40;
	/** @type {Map<number, Status>} SlimeBeep friends' and group members' statuses, by member number (this visit only). */
	const statuses = new Map();
	/** Your status as last sent, so a change goes out once. */
	let statusSent = JSON.stringify({ t: '', l: '' });
	/** Date.now() when your status changed, waiting STATUS_SETTLE to go out; 0 when nothing waits. */
	let statusChanged = 0;
	/** Member number -> when we last asked them for their status (with a ping). */
	const statusAsked = new Map();

	/** Member number -> when we last asked them for their picture. */
	const asked = new Map();
	/** Member number -> when we last sent them ours. */
	const sentPic = new Map();
	/** @type {Map<number, { v: string, n: number, parts: string[] }>} Member number -> a picture being received in pieces. */
	const pieces = new Map();
	/**
	 * A hidden beep's content (JSON). Every one has `sb: 1`, your picture version `pv`, key start `kf` and,
	 * except picture pieces, your encryption key `ek`.
	 * @typedef {object} HiddenPayload
	 * @property {number} sb always 1
	 * @property {string} [kf] the sender's key start
	 * @property {string} [ek] the sender's encryption public key ("x.y")
	 * @property {string | 0} [pv] the sender's picture version; 0 = no picture
	 * @property {1} [pfreq] asks for your picture
	 * @property {{ v: string, i: number, n: number, d: string }} [pf] piece `i` of `n` of picture version `v`
	 * @property {1} [ping] "do you have SlimeBeep?"
	 * @property {1} [pong] the answer
	 * @property {{ code: string, name: string }} [ginv] a group invite
	 * @property {MusicState} [music] the song they share with you (see takeJam)
	 * @property {1} [musicEnd] they stopped sharing it
	 * @property {QueueItem[]} [mq] the songs coming after the one they share
	 * @property {{ u: string, ti: string }} [madd] asks you, the host, to queue a song
	 * @property {number} [mskip] asks you, the host, to skip the song with this number (one they added)
	 * @property {0 | 1} [mlisten] they started (1) or stopped (0) listening along to the song you share
	 * @property {Status | 0} [st] their status (0: none); every hidden beep but picture pieces has it
	 */
	/**
	 * Picture fields of a hidden beep: `pv` (their picture version; 0 = none) makes us ask for a new one,
	 * `pfreq` asks for ours, `pf` is one piece of theirs.
	 * @param {number} from
	 * @param {Partial<HiddenPayload>} p
	 */
	function pictureNews(from, p) {
		const known = loadPfps()[from];
		if (p.pv === 0 && known) {
			delete loadPfps()[from];
			savePfps();
		}
		if (isId(p.pv) && (!known || known.v !== p.pv) && Date.now() - (asked.get(from) || 0) > 60000) {
			asked.set(from, Date.now());
			sendHidden(from, { sb: 1, pfreq: 1 });
		}
		if (p.pfreq === 1) {
			const pic = myPfp();
			if (!pic || Date.now() - (sentPic.get(from) || 0) < 60000) {
				return;
			}
			sentPic.set(from, Date.now());
			const parts = Math.ceil(pic.data.length / PFP_CHUNK);
			// 250 ms apart.
			for (let i = 0; i < parts; i++) {
				setTimeout(
					() => sendHidden(from, { sb: 1, pf: { v: pic.v, i, n: parts, d: pic.data.slice(i * PFP_CHUNK, (i + 1) * PFP_CHUNK) } }),
					i * 250,
				);
			}
		}
		const pf = p.pf;
		if (
			pf &&
			typeof pf === 'object' &&
			isId(pf.v) &&
			Number.isInteger(pf.i) &&
			Number.isInteger(pf.n) &&
			pf.n > 0 &&
			pf.n <= Math.ceil(PFP_MAX / PFP_CHUNK) &&
			pf.i >= 0 &&
			pf.i < pf.n &&
			typeof pf.d === 'string' &&
			pf.d.length <= PFP_CHUNK
		) {
			let got = pieces.get(from);
			if (!got || got.v !== pf.v || got.n !== pf.n) {
				got = { v: pf.v, n: pf.n, parts: [] };
			}
			got.parts[pf.i] = pf.d;
			pieces.set(from, got);
			if (got.parts.filter((part) => typeof part === 'string').length === got.n) {
				pieces.delete(from);
				const data = got.parts.join('');
				if (data.length <= PFP_MAX && PFP_RE.test(data)) {
					loadPfps()[from] = { v: got.v, data };
					savePfps();
					if (isOpen()) {
						render(true);
					}
				}
			}
		}
	}

	/** localStorage key of your picture's uncropped source (max 320 px), kept for "Adjust". */
	const srcKey = () => `slimebeep.pfpsrc.${Player.MemberNumber}`;
	/** Your picture's uncropped source, or null. */
	const loadSrc = () => {
		try {
			const d = localStorage.getItem(srcKey());
			return d && /^data:image\/(webp|jpeg|png);base64,/.test(d) ? d : null;
		} catch (e) {
			return null;
		}
	};
	/** @typedef {((data: string) => void) | null} PictureSaver gets a cropped picture instead of it becoming yours (group pictures) */
	/**
	 * Reads a picked image file, scales it to at most 320 px and opens the cropper on it.
	 * @param {File | null | undefined} file
	 * @param {PictureSaver} [onSave]
	 * @param {string} [title] the cropper's heading
	 */
	function setPicture(file, onSave = null, title = '') {
		if (!file || !/^image\//.test(file.type)) {
			notify('That is not a picture');
			return;
		}
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			try {
				const k = Math.min(1, 320 / Math.max(img.naturalWidth, img.naturalHeight));
				const c = document.createElement('canvas');
				c.width = Math.max(1, Math.round(img.naturalWidth * k));
				c.height = Math.max(1, Math.round(img.naturalHeight * k));
				/** @type {CanvasRenderingContext2D} */ (c.getContext('2d')).drawImage(img, 0, 0, c.width, c.height);
				const src = c.toDataURL('image/jpeg', 0.9);
				if (!onSave) {
					try {
						localStorage.setItem(srcKey(), src);
					} catch (e) {
						/* this visit only */
					}
				}
				openCropper(src, onSave, title);
			} catch (e) {
				notify('That picture could not be read');
			} finally {
				URL.revokeObjectURL(url);
			}
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			notify('That picture could not be read');
		};
		img.src = url;
	}
	/**
	 * Opens the file picker, then setPicture.
	 * @param {PictureSaver} [onSave]
	 * @param {string} [title]
	 */
	function pickPicture(onSave = null, title = '') {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.addEventListener('change', () => setPicture(input.files && input.files[0], onSave, title));
		input.click();
	}
	/**
	 * The cropper: drag and zoom `src` inside a circle. Save makes the result (128 px, under PFP_MAX)
	 * your picture, or passes it to `onSave`.
	 * @param {string} src an image data URL
	 * @param {PictureSaver} [onSave]
	 * @param {string} [title]
	 */
	function openCropper(src, onSave = null, title = '') {
		if ($('sb-crop')) {
			$('sb-crop').remove();
		}
		if (!isOpen()) {
			setOpen(true);
		}
		const SIZE = 200;
		const img = new Image();
		img.onload = () => {
			const w = img.naturalWidth,
				h = img.naturalHeight;
			const base = SIZE / Math.min(w, h); // zoom 1: the short side fills the circle
			let zoom = 1,
				x = 0,
				y = 0; // x, y: the picture's centre offset from the circle's, in screen px
			const box = document.createElement('div');
			box.id = 'sb-crop';
			setHtml(
				box,
				html`<div class="sb-crop-card">
				<button class="sb-crop-x" data-act="cancel" title="Close">${ICONS.close}</button>
				<b>${title || 'Fit your picture in the circle'}</b>
				<div class="sb-crop-ring" style="width:${SIZE}px;height:${SIZE}px"><canvas width="${SIZE}" height="${SIZE}"></canvas></div>
				<span class="sb-hint">Drag to move it, scroll or slide to zoom.</span>
				<input type="range" min="1" max="4" step="0.01" value="1" aria-label="Zoom">
				<div class="sb-crop-btns"><button class="sb-pill" data-act="cancel">Cancel</button><button class="sb-go" data-act="save">Save</button></div>
			</div>`,
			);
			if (!isOpen()) {
				setOpen(true);
			}
			$('sb-panel').appendChild(box);
			// Closed by Cancel, ✕, a click outside the card, Escape, or the panel closing.
			/** @param {KeyboardEvent} e */
			const onKey = (e) => {
				if (e.key === 'Escape' && document.body.contains(box)) {
					e.stopPropagation();
					box.remove();
				}
			};
			document.addEventListener('keydown', onKey, true);
			new MutationObserver((m, obs) => {
				if (!document.body.contains(box)) {
					document.removeEventListener('keydown', onKey, true);
					obs.disconnect();
				}
			}).observe($('sb-panel'), { childList: true });
			box.addEventListener('keydown', (e) => e.stopPropagation());
			const cv = /** @type {HTMLCanvasElement} */ (box.querySelector('canvas'));
			const ctx = /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d'));
			const slider = /** @type {HTMLInputElement} */ (box.querySelector('input'));
			// The picture always covers the whole circle.
			const clampXY = () => {
				const sw = w * base * zoom,
					sh = h * base * zoom;
				x = Math.max(-(sw - SIZE) / 2, Math.min((sw - SIZE) / 2, x));
				y = Math.max(-(sh - SIZE) / 2, Math.min((sh - SIZE) / 2, y));
			};
			/**
			 * Draws the picture as placed now, onto the cropper or onto the output canvas.
			 * @param {CanvasRenderingContext2D} [to]
			 * @param {number} [size]
			 */
			const draw = (to = ctx, size = SIZE) => {
				const k = size / SIZE,
					sw = w * base * zoom * k,
					sh = h * base * zoom * k;
				to.clearRect(0, 0, size, size);
				to.drawImage(img, size / 2 + x * k - sw / 2, size / 2 + y * k - sh / 2, sw, sh);
			};
			/** @param {number} z */
			const setZoom = (z) => {
				zoom = Math.max(1, Math.min(4, z));
				slider.value = String(zoom);
				clampXY();
				draw();
			};
			draw();
			/** @type {{ px: number, py: number, x: number, y: number } | null} Drag start: pointer and picture position. */
			let drag = null;
			cv.addEventListener('pointerdown', (e) => {
				drag = { px: e.clientX, py: e.clientY, x, y };
				cv.setPointerCapture(e.pointerId);
			});
			cv.addEventListener('pointermove', (e) => {
				if (!drag) {
					return;
				}
				x = drag.x + e.clientX - drag.px;
				y = drag.y + e.clientY - drag.py;
				clampXY();
				draw();
			});
			cv.addEventListener('pointerup', () => {
				drag = null;
			});
			cv.addEventListener(
				'wheel',
				(e) => {
					e.preventDefault();
					setZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
				},
				{ passive: false },
			);
			slider.addEventListener('input', () => setZoom(Number(slider.value)));
			box.addEventListener('click', (e) => {
				const act = targetOf(e).dataset.act;
				if (targetOf(e) === box || act === 'cancel') {
					box.remove();
					return;
				}
				if (act !== 'save') {
					return;
				}
				let data = '';
				for (const size of [128, 96, 64]) {
					const out = document.createElement('canvas');
					out.width = out.height = size;
					const octx = /** @type {CanvasRenderingContext2D} */ (out.getContext('2d'));
					octx.imageSmoothingQuality = 'high';
					draw(octx, size);
					for (const q of [0.9, 0.8, 0.65, 0.5]) {
						data = out.toDataURL('image/webp', q);
						if (!data.startsWith('data:image/webp')) {
							data = out.toDataURL('image/jpeg', q);
						}
						if (data.length <= PFP_MAX) {
							break;
						}
					}
					if (data.length <= PFP_MAX) {
						break;
					}
				}
				if (data.length > PFP_MAX || !PFP_RE.test(data)) {
					notify('That picture is too big, try another');
					return;
				}
				box.remove();
				if (onSave) {
					onSave(data);
					return;
				}
				setMyPfp({ v: newId(), data });
				unlock('gu');
				pushPicture();
				showMe();
				notify('✓ New profile picture');
				if (isOpen()) {
					render(true);
				}
			});
		};
		img.onerror = () => notify('That picture could not be read');
		img.src = src;
	}
	/** Image element drawMyPic draws from. */
	const picImg = new Image();
	/**
	 * Draws your picture in a circle on the game's canvas (Extensions page).
	 * @param {number} left
	 * @param {number} top
	 * @param {number} size
	 */
	function drawMyPic(left, top, size) {
		const pic = myPfp();
		if (!pic || typeof MainCanvas === 'undefined' || !MainCanvas) {
			return;
		}
		if (picImg.src !== pic.data) {
			picImg.src = pic.data;
		}
		if (!picImg.complete || !picImg.naturalWidth) {
			return;
		}
		MainCanvas.save();
		MainCanvas.beginPath();
		MainCanvas.arc(left + size / 2, top + size / 2, size / 2, 0, Math.PI * 2);
		MainCanvas.clip();
		MainCanvas.drawImage(picImg, left, top, size, size);
		MainCanvas.restore();
	}
	/**
	 * A picture shown big, until clicked or Escape.
	 * @param {string} src an image data URL
	 */
	function zoomPic(src) {
		if (!PFP_RE.test(src)) {
			return;
		}
		if ($('sb-zoom')) {
			$('sb-zoom').remove();
		}
		const box = document.createElement('div');
		box.id = 'sb-zoom';
		const img = document.createElement('img');
		img.src = src;
		img.alt = '';
		box.appendChild(img);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', close);
		document.addEventListener('keydown', onKey, true);
		if (!isOpen()) {
			setOpen(true);
		}
		$('sb-panel').appendChild(box);
	}
	/** Your own picture (or initials) in the panel header; clicking it opens the options. */
	function showMe() {
		const me = $('sb-me');
		if (!me) {
			return;
		}
		setHtml(me, html`${loggedIn() && avatar(Player.MemberNumber, myName())}`);
		if (!loggedIn()) {
			me.title = '';
		} else {
			me.title = opts.status ? `Your status: ${opts.status}` : 'Set your status';
		}
	}

	/**
	 * A hidden beep (BeepType PROTO) from a friend: JSON with `sb: 1` and any of `kf` (their key start),
	 * picture fields (pictureNews), `ping`/`pong` (SlimeBeep check), `ginv` (group invite), `music`/`musicEnd`/`mq` (a shared
	 * song and what comes next) or `madd`/`mskip`/`mlisten` (a listener's songs, and that they listen).
	 * Ignored from non-friends; the sender's member number comes from the game server.
	 * @param {ServerBeep} d
	 */
	function onHidden(d) {
		if (!loggedIn() || !isNum(d.MemberNumber) || typeof d.Message !== 'string' || d.Message.length > 1000) {
			return;
		}
		const from = d.MemberNumber;
		if (from === Player.MemberNumber || !isFriend(from) || !allow(from)) {
			return;
		}
		if (histOwner !== Player.MemberNumber) {
			loadHistory();
		}
		/** @type {Partial<HiddenPayload> | null} */
		let p;
		try {
			p = JSON.parse(d.Message);
		} catch (e) {
			return;
		}
		if (!p || typeof p !== 'object' || Array.isArray(p) || p.sb !== 1) {
			return;
		}

		// Any hidden beep shows the sender has SlimeBeep.
		if (!peers.has(from)) {
			foundPeer(from);
		}
		if (typeof p.kf === 'string' && /^[A-Za-z0-9_-]{16}$/.test(p.kf) && peerKeys[from] !== p.kf) {
			if (peerKeys[from]) {
				peerWas[from] = peerKeys[from];
			}
			peerKeys[from] = p.kf;
			saveGC();
		}
		if (typeof p.ek === 'string' && EK_RE.test(p.ek) && peerEks[from] !== p.ek) {
			peerEks[from] = p.ek;
			saveGC();
		}
		pictureNews(from, p);
		if (p.st !== undefined) {
			takeStatus(from, p.st);
		}
		if (p.ping === 1) {
			answerPing(from);
		}
		if (p.ginv && typeof p.ginv === 'object') {
			takeInvite(from, d.MemberName, p.ginv);
		}
		if (p.music) {
			takeJam(`n:${from}`, from, nameOf(from), p.music);
		}
		if (p.musicEnd === 1) {
			takeJam(`n:${from}`, from, nameOf(from), null);
		}
		if (p.mq) {
			takeQueue(`n:${from}`, from, p.mq);
		}
		if (p.madd && typeof p.madd === 'object') {
			takeAdd(`n:${from}`, from, p.madd.u, p.madd.ti);
		}
		if (p.mskip) {
			takeSkip(`n:${from}`, from, p.mskip);
		}
		if ((p.mlisten === 0 || p.mlisten === 1) && sharing === `n:${from}`) {
			takeEars(`n:${from}`, p.mlisten ? [from] : []);
		}
	}
	/**
	 * Records a friend as having SlimeBeep and redraws, so the 🫧 by their name shows.
	 * @param {number} n
	 */
	function foundPeer(n) {
		peers.add(n);
		saveGC();
		emit('slimeBeepFriend', { memberNumber: n });
		if (isOpen()) {
			render(true);
		}
	}
	/**
	 * Answers a friend's "do you have SlimeBeep?" with a pong, at most once a minute per friend.
	 * @param {number} n
	 */
	function answerPing(n) {
		if (Date.now() - (ponged.get(n) || 0) < 60000) {
			return;
		}
		ponged.set(n, Date.now());
		sendHidden(n, { sb: 1, pong: 1 });
	}
	/** Your status now: your own line, the song playing unless you hide it, and your achievements. */
	const myStatus = () => {
		const m = music;
		const l = opts.showListening && m && m.playing && m.started ? m.track.title.slice(0, STATUS_MAX) : '';
		const got = loggedIn() ? loadAch().got : {};
		return { t: String(opts.status || '').slice(0, STATUS_MAX), l, a: ACHIEVEMENTS.map((x) => x[0]).filter((id) => got[id]) };
	};
	/** Your achievements (loaded for the account logged in). */
	function loadAch() {
		const me = Player.MemberNumber;
		if (ach && ach.owner === me) {
			return ach;
		}
		/** @type {Achievements} */
		const fresh = { owner: me, got: {}, royal: 0 };
		try {
			const saved = JSON.parse(localStorage.getItem(`slimebeep.ach.${me}`) || 'null');
			if (saved && typeof saved === 'object') {
				for (const [id] of ACHIEVEMENTS) {
					if (typeof saved.got?.[id] === 'number') {
						fresh.got[id] = saved.got[id];
					}
				}
				fresh.royal = typeof saved.royal === 'number' && saved.royal >= 0 ? saved.royal : 0;
			}
		} catch (e) {
			/* starts empty */
		}
		ach = fresh;
		return ach;
	}
	/** Saves your achievements for your account. */
	function saveAch() {
		if (!ach) {
			return;
		}
		try {
			localStorage.setItem(`slimebeep.ach.${ach.owner}`, JSON.stringify({ got: ach.got, royal: ach.royal }));
		} catch (e) {
			/* private window: kept this visit */
		}
	}
	/**
	 * Unlocks an achievement (once): a gold pop-up and a chime, quiet in Do not disturb. Friends see it with your status.
	 * @param {string} id
	 */
	function unlock(id) {
		const a = ACHIEVEMENTS.find((x) => x[0] === id);
		if (!a || !loggedIn() || loadAch().got[id]) {
			return;
		}
		loadAch().got[id] = Date.now();
		saveAch();
		if (isOpen()) {
			render(true);
		}
		if (opts.dnd) {
			return;
		}
		fanfare(CHIME);
		const [, emoji, name, how] = a;
		if (gameToasts()) {
			gameToast({ title: '🏆 Achievement unlocked', text: `${emoji} ${name}\n${how}`, ms: 7000, category: 'SlimeBeep-ach' });
		} else {
			card({ icon: html`<span class="sb-av sb-gav">🏆</span>`, title: '🏆 Achievement unlocked', text: `${emoji} ${name}`, sub: how });
		}
	}
	/**
	 * An activity in the room: a sip of a drink unlocks Care for a Drink?, a bite of food A Treat for the Road
	 * (yourself, or given one).
	 * @param {{ Sender?: number, Content?: unknown, Dictionary?: unknown }} m the game's chat message
	 */
	function drinkNews(m) {
		const what = typeof m.Content === 'string' ? m.Content : '';
		let id = '';
		if (/SipItem|Drink/i.test(what)) {
			id = 'cd';
		} else if (/EatItem/i.test(what)) {
			id = 'tr';
		}
		if (!id || !loggedIn()) {
			return;
		}
		const me = Player.MemberNumber;
		const dict = Array.isArray(m.Dictionary) ? /** @type {({ TargetCharacter?: unknown } | null)[]} */ (m.Dictionary) : [];
		const target = dict.find((x) => x && isNum(x.TargetCharacter));
		if ((/^ChatSelf/.test(what) && m.Sender === me) || (target && Number(target.TargetCharacter) === me)) {
			unlock(id);
		}
	}
	/**
	 * An item used in the room: Slime on someone counts toward achievements.
	 * @param {{ Sender?: number, Dictionary?: unknown }} m the game's chat message
	 */
	function slimeNews(m) {
		if (!Array.isArray(m.Dictionary) || !loggedIn()) {
			return;
		}
		const dict = /** @type {({ Tag?: unknown, AssetName?: unknown, TargetCharacter?: unknown } | null)[]} */ (m.Dictionary);
		const next = dict.find((x) => x && x.Tag === 'NextAsset');
		const target = dict.find((x) => x && isNum(x.TargetCharacter));
		if (!next || next.AssetName !== 'Slime' || !target) {
			return;
		}
		const to = Number(target.TargetCharacter);
		const me = Player.MemberNumber;
		if (m.Sender === me && to !== me) {
			unlock('sl');
			// Your own game shows the item on them already; the moment's wait is for slower updates.
			setTimeout(() => {
				if (slimeOn(to) >= 4) {
					unlock('sb');
				}
			}, 500);
		} else if (m.Sender === OWNER && to === me) {
			unlock('rs');
		}
	}
	/**
	 * How many places someone in your room has Slime on.
	 * @param {number} n
	 */
	const slimeOn = (n) => {
		const c =
			typeof ChatRoomCharacter === 'object' && Array.isArray(ChatRoomCharacter)
				? ChatRoomCharacter.find((x) => x && x.MemberNumber === n)
				: undefined;
		return c && Array.isArray(c.Appearance) ? c.Appearance.filter((x) => x && x.Asset && x.Asset.Name === 'Slime').length : 0;
	};
	/** Every second: achievements that come with time (near the Slime Queen, at night, being her). */
	function achTick() {
		const me = Player.MemberNumber;
		if (me === OWNER) {
			crownCreator();
			return;
		}
		if (opts.night && new Date().getHours() < 4) {
			unlock('no');
		}
		if (QUEEN_GIFTS.includes(me)) {
			unlock('lq');
		}
		const nick = String(Player.Nickname || '').trim();
		if (nick.toLowerCase() === QUEEN_NAME) {
			unlock('ah');
		}
		if (myRoom() && /velvet.*cabaret/i.test(String(ChatRoomData && ChatRoomData.Name))) {
			unlock('vc');
		}
		if (allSlotsUsed()) {
			unlock('se');
		}
		const eating =
			Array.isArray(Player.Appearance) &&
			Player.Appearance.some(
				(x) =>
					x &&
					x.Asset &&
					x.Asset.Group &&
					/^Item(Mouth[23]?|Hood)$/.test(String(x.Asset.Group.Name)) &&
					ECHO_FOODS.includes(String(x.Asset.Name)),
			);
		if (eating) {
			unlock('tr');
		}
		// Echo's weapon set (武器组合) in the hands, on its La Pluma scythe (type 4).
		const held = Array.isArray(Player.Appearance)
			? Player.Appearance.find((x) => x && x.Asset && x.Asset.Group && x.Asset.Group.Name === 'ItemHandheld')
			: undefined;
		// The game's Plushie, Velvet Bunny Cabaret group, option 1: Slime Queen Samantha.
		if (
			held &&
			held.Asset &&
			held.Asset.Name === 'Plushie' &&
			held.Property &&
			held.Property.TypeRecord &&
			held.Property.TypeRecord.VelvetBunnyCabaret === 1
		) {
			unlock('rc');
		}
		if (
			held &&
			held.Asset &&
			held.Asset.Name === '武器组合' &&
			held.Property &&
			held.Property.TypeRecord &&
			held.Property.TypeRecord.t === 4
		) {
			unlock('cw');
		}
		const a = loadAch();
		const withQueen =
			me !== OWNER &&
			typeof ChatRoomCharacter === 'object' &&
			Array.isArray(ChatRoomCharacter) &&
			ServerPlayerIsInChatRoom() &&
			ChatRoomCharacter.some((c) => c && c.MemberNumber === OWNER);
		if (withQueen && !a.got.ra) {
			a.royal += 1;
			if (a.royal >= ROYAL_SECONDS) {
				unlock('ra');
			} else if (a.royal % 10 === 0) {
				saveAch();
			}
		}
	}
	/** SlimeBeep's maker has every achievement: one pop-up says so the first time. */
	function crownCreator() {
		const a = loadAch();
		const notYet = ACHIEVEMENTS.filter(([id]) => !a.got[id]);
		if (!notYet.length) {
			return;
		}
		for (const [id] of notYet) {
			a.got[id] = Date.now();
		}
		saveAch();
		if (isOpen()) {
			render(true);
		}
		if (!opts.dnd) {
			fanfare(TADA);
			const text = 'Every achievement is yours: you made SlimeBeep';
			if (gameToasts()) {
				gameToast({ title: '👑 Slime Queen', text, ms: 7000, category: 'SlimeBeep-ach' });
			} else {
				notify(`👑 ${text}`);
			}
		}
	}
	/**
	 * Whether every item slot on your body (each item group with a zone to click) holds an item, or is blocked
	 * by one (a hood covering the mouth slots, say).
	 */
	function allSlotsUsed() {
		const w = /** @type {any} */ (window);
		if (!Array.isArray(w.AssetGroup) || typeof w.InventoryGet !== 'function') {
			return false;
		}
		const slots = w.AssetGroup.filter(
			(/** @type {any} */ g) => g && g.Category === 'Item' && g.Zone && (!g.Family || g.Family === Player.AssetFamily),
		);
		if (!slots.length) {
			return false;
		}
		return slots.every(
			(/** @type {any} */ g) =>
				w.InventoryGet(Player, g.Name) || (typeof w.InventoryGroupIsBlocked === 'function' && w.InventoryGroupIsBlocked(Player, g.Name)),
		);
	}
	/**
	 * Your achievements, or a friend's (from their status), unlocked ones first; secrets stay ??? until unlocked.
	 * @param {number} [n] a friend's member number; 0 for yours
	 */
	function openAchievements(n = 0) {
		if ($('sb-ask')) {
			return;
		}
		const theirs = n ? statuses.get(n) : undefined;
		/** @type {Record<string, number>} Theirs come without dates. */
		const got = theirs ? Object.fromEntries(theirs.a.map((id) => [id, 0])) : loadAch().got;
		const has = (/** @type {string} */ id) => Object.hasOwn(got, id);
		const shown = ACHIEVEMENTS.filter(([id]) => !MOD_ONLY[id] || hasMod(MOD_ONLY[id]) || has(id));
		const list = shown.sort((x, y) => Number(has(y[0])) - Number(has(x[0])));
		const box = document.createElement('div');
		box.id = 'sb-ask';
		setHtml(
			box,
			html`<div class="sb-crop-card sb-ach-card">
			<b>🏆 ${n ? `${nameOf(n)}'s achievements` : 'Achievements'} · ${shown.filter(([id]) => has(id)).length} / ${shown.length}</b>
			<div class="sb-ach-list">${list.map(([id, emoji, name, how, secret]) => {
				const when = got[id];
				const hidden = secret && !has(id);
				return html`<div class="sb-ach${has(id) ? ' on' : ''}"><span class="sb-ach-emoji">${hidden ? '❔' : emoji}</span><span class="sb-main"><span class="sb-name">${hidden ? '???' : name}</span><span class="sb-sub">${how}${!!when && ` · ${new Date(when).toLocaleDateString()}`}</span></span></div>`;
			})}</div>
			${!n && html`<span class="sb-hint" style="text-align:center">SlimeBeep friends and your group chats see them too.</span>`}
			<button class="sb-go" data-act="close">Close</button>
		</div>`,
		);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			if (targetOf(e) === box || targetOf(e).dataset.act === 'close') {
				close();
			}
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
	}
	/**
	 * Someone's status, from a hidden beep or a group's relay.
	 * @param {number} n
	 * @param {unknown} s a Status; 0 or null for none
	 */
	function takeStatus(n, s) {
		const x = /** @type {Partial<Status> | null} */ (s && typeof s === 'object' ? s : null);
		const t = x ? clean(x.t, STATUS_MAX) : '';
		const l = x ? clean(x.l, STATUS_MAX) : '';
		const known = x && Array.isArray(x.a) ? x.a : [];
		// Only achievements this version knows, once each.
		const a = ACHIEVEMENTS.map((y) => y[0]).filter((id) => known.includes(id));
		const before = JSON.stringify(statuses.get(n) || null);
		if (t || l || a.length) {
			statuses.set(n, { t, l, a });
		} else {
			statuses.delete(n);
		}
		if (JSON.stringify(statuses.get(n) || null) !== before && isOpen()) {
			render(true);
		}
	}
	/** Every second: a changed status goes out once it has settled, to your groups and online SlimeBeep friends. */
	function statusTick() {
		const now = JSON.stringify(myStatus());
		if (now === statusSent) {
			statusChanged = 0;
			return;
		}
		if (!statusChanged) {
			statusChanged = Date.now();
		}
		if (Date.now() - statusChanged < STATUS_SETTLE) {
			return;
		}
		statusSent = now;
		statusChanged = 0;
		const st = myStatus();
		for (const id of Object.keys(groups)) {
			relaySend(id, { t: 'status', s: st.t || st.l || st.a.length ? st : null });
		}
		// Every hidden beep carries the status: a bare one is enough.
		for (const f of friends.filter((x) => peers.has(x.MemberNumber)).slice(0, STATUS_FRIENDS)) {
			sendHidden(f.MemberNumber, { sb: 1 });
		}
	}
	/**
	 * Asks a SlimeBeep friend for their status (their pong carries it), at most every 5 minutes.
	 * @param {number} n
	 */
	function askStatus(n) {
		if (!peers.has(n) || statuses.has(n) || Date.now() - (statusAsked.get(n) || 0) < 300000) {
			return;
		}
		statusAsked.set(n, Date.now());
		sendHidden(n, { sb: 1, ping: 1 });
	}
	/**
	 * Someone's status as a line under their name; nothing when they have none.
	 * @param {number} n
	 * @returns {HtmlValue}
	 */
	function statusLine(n) {
		const s = statuses.get(n);
		if (!s) {
			return '';
		}
		const text = [s.t, s.l && `🎵 ${s.l}`].filter(Boolean).join(' · ');
		const names = ACHIEVEMENTS.filter((x) => s.a.includes(x[0])).map((x) => `${x[1]} ${x[2]}`);
		return html`<div class="sb-status" title="${[text, ...names].filter(Boolean).join('\n')}">${!!names.length && html`<button class="sb-trophy" data-ach="${n}" title="See their achievements">🏆 ${names.length}</button>`}${text}</div>`;
	}
	/** Your own row at the top of 💖, like Discord's: your picture, name and status (tap it to change the status). */
	function meRow() {
		const st = myStatus();
		const text = [st.t, st.l && `🎵 ${st.l}`].filter(Boolean).join(' · ');
		return html`<div class="sb-row sb-merow" id="sb-merow" title="Set your status">${avatar(Player.MemberNumber, myName())}
			<div class="sb-main"><div class="sb-name">${myName()} <small class="sb-hint">(you)</small></div>
			${text ? html`<div class="sb-status" title="${text}">${text}</div>` : html`<div class="sb-sub">💬 Set a status…</div>`}</div>
			<button class="sb-pill sb-achbtn" id="sb-achbtn" title="Your achievements">🏆 ${st.a.length}/${ACHIEVEMENTS.length}</button></div>`;
	}
	/** The box for your status and achievements (your picture at the top, or your row in 💖, opens it). */
	function openStatus() {
		if ($('sb-ask')) {
			return;
		}
		const box = document.createElement('div');
		box.id = 'sb-ask';
		setHtml(
			box,
			html`<div class="sb-crop-card sb-status-card">
			<b>Set your status</b>
			<input class="sb-search" id="sb-status-text" maxlength="${STATUS_MAX}" placeholder="What's up? (like king of the swamp)" aria-label="Your status">
			<label class="sb-hint"><input type="checkbox" id="sb-status-music"> Show what I'm listening to</label>
			<span class="sb-hint" style="text-align:center">SlimeBeep friends and your group chats see it.</span>
			<div class="sb-crop-btns" style="flex-wrap:wrap;justify-content:center"><button class="sb-pill" data-act="ach">🏆 Achievements · ${myStatus().a.length}/${ACHIEVEMENTS.length}</button><button class="sb-pill" data-act="pic">🖼 Picture and settings</button></div>
			<div class="sb-crop-btns" style="justify-content:center"><button class="sb-pill" data-act="clear">Clear</button><button class="sb-go" data-act="save">Save</button></div>
		</div>`,
		);
		const text = /** @type {HTMLInputElement} */ (box.querySelector('#sb-status-text'));
		const showSong = /** @type {HTMLInputElement} */ (box.querySelector('#sb-status-music'));
		text.value = opts.status;
		showSong.checked = opts.showListening;
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		const save = () => {
			setOpt('status', clean(text.value, STATUS_MAX));
			setOpt('showListening', showSong.checked);
			if (opts.status) {
				unlock('st');
			}
			close();
			notify(opts.status ? `💬 Status set: ${opts.status}` : '💬 Status cleared');
			render(true);
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			} else if (e.key === 'Enter' && e.target === text) {
				e.preventDefault();
				save();
			}
		};
		box.addEventListener('click', (e) => {
			const act = targetOf(e).dataset.act;
			if (targetOf(e) === box) {
				close();
			} else if (act === 'clear') {
				text.value = '';
				save();
			} else if (act === 'save') {
				save();
			} else if (act === 'pic') {
				close();
				openSettings();
			} else if (act === 'ach') {
				close();
				openAchievements();
			}
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
		text.focus();
	}
	/**
	 * Keeps a friend's group invite in `invitations` and shows a card; nothing is joined automatically.
	 * @param {number} from
	 * @param {string} senderName
	 * @param {{ code?: unknown, name?: unknown }} ginv
	 * @param {boolean} [quiet] no card or sound (the invite came in a beep, which has its own)
	 */
	function takeInvite(from, senderName, ginv, quiet = false) {
		const m = CODE_RE.exec(typeof ginv.code === 'string' ? ginv.code : '');
		if (!m || groups[m[1]]) {
			return;
		}
		const name = clean(ginv.name, LIMITS.name) || 'Group chat';
		const fromName = clean(senderName, LIMITS.name) || `#${from}`;
		invitations = [
			...invitations.filter((i) => !i.code.startsWith(`SB-${m[1]}-`)),
			{ code: m[0], name, from, fromName, at: Date.now() },
		].slice(-20);
		saveGC();
		if (quiet) {
			if (isOpen() && tab === 'groups' && thread === null) {
				render(true);
			}
			return;
		}
		if (opts.sound && chatLevel(`n:${from}`) !== 'none') {
			chime();
		}
		card({
			icon: avatar(from, fromName),
			pic: (pfpOf(from) || {}).data,
			title: `👥 ${name}`,
			text: `${fromName} invited you to a group chat. Tap to see it.`,
			onClick: () => {
				tab = 'groups';
				thread = null;
				if (!isOpen()) {
					setOpen(true);
				} else {
					render();
				}
			},
		});
		if (isOpen() && tab === 'groups' && thread === null) {
			render(true);
		}
	}

	/**
	 * A message from the relay (JSON). Which fields are set depends on `t`; see relay/src/index.js.
	 * @typedef {object} RelayMessage
	 * @property {string} t 'hello', 'welcome', 'roster', 'presence', 'msg', 'history', 'keys', 'pic', 'gpic', 'invite', 'music',
	 * 'musicQueue', 'musicAdd', 'musicSkip', 'musicListeners', 'status', 'statuses', 'pong', 'gone', 'error', 'ok', 'mail', 'rekeyed'
	 * @property {string} [nonce] hello: what to sign
	 * @property {string} [x] rekeyed: the public x of the key the group now knows you by
	 * @property {RelayRoster} [roster] welcome, roster
	 * @property {number[]} [online] presence
	 * @property {RelayGroupMessage} [m] msg
	 * @property {RelayGroupMessage[]} [msgs] history
	 * @property {number} [n] pic: whose picture; status: whose status
	 * @property {string | null} [data] pic, gpic: the picture, or null when removed
	 * @property {string} [code] invite: the new secret
	 * @property {string} [why] error, gone
	 * @property {boolean} [fatal] error: the connection is closed
	 * @property {string} [ref] ok, error: the id sent with the request
	 * @property {MailItem[]} [list] mail (musicListeners: who listens along, member numbers; statuses: { n, s } each)
	 * @property {unknown} [s] status: the member's status (null: none)
	 * @property {(MusicState & { by: number, name: string }) | null} [music] music: the song shared in the group and its host; null when they stopped
	 * @property {number} [by] music: who stopped sharing (with music null); musicAdd, musicSkip: who asks
	 * @property {number} [age] music: ms since it was set
	 * @property {unknown} [q] musicQueue: the songs coming after the shared one
	 * @property {string} [u] musicAdd: the link of the song a member asks you, the host, to queue
	 * @property {string} [ti] musicAdd: its title
	 * @property {number} [id] musicSkip: the number of the song a member asks you, the host, to skip
	 * @property {number} [epoch] keys: the group key's current epoch (0: none yet)
	 * @property {boolean} [rekey] keys: a member left or the key is old, so a new key is needed
	 * @property {{ e: number, w: { to: number, by: number, ek: string, iv: string, ct: string, sig: string } }[]} [mine] keys: the wraps sent to you
	 * @property {number[]} [needs] keys: members who don't have the current key yet
	 */
	/**
	 * A group's roster as the relay sends it.
	 * @typedef {object} RelayRoster
	 * @property {string} name
	 * @property {number} owner
	 * @property {number[]} admins
	 * @property {boolean} open
	 * @property {number[]} online
	 * @property {GroupMember[]} members
	 */
	/**
	 * A stored group message.
	 * @typedef {object} RelayGroupMessage
	 * @property {number} id
	 * @property {number} at
	 * @property {number} [from]
	 * @property {string} [name]
	 * @property {string} [text] a system line's text, or a sealed message's once opened
	 * @property {Sealed & { e: number }} [enc] the sealed message and the epoch of its key
	 * @property {boolean} [sys] a system line ("X joined")
	 */
	/**
	 * A beep left in a mailbox.
	 * @typedef {object} MailItem
	 * @property {string} id
	 * @property {number} from
	 * @property {string} name
	 * @property {string} fromKf the start of the key the sender signed in with
	 * @property {Sealed & { e: string }} enc the beep sealed to your encryption key (see sealMail)
	 * @property {number} at
	 * @property {Handover} [rk] the sender moved to new keys: how their old ones handed over (see followKey)
	 * @property {{ x: string, y: string }} [pub] with `rk`: the key the sender signed in with
	 */
	/**
	 * A relay connection to one group.
	 * @typedef {object} Conn
	 * @property {WebSocket | null} ws
	 * @property {boolean} ready signed in
	 * @property {number} [retry] reconnects so far (for the backoff)
	 * @property {object[]} queue messages waiting for the sign-in
	 * @property {((code: string | null, why?: string) => void)[]} waiters callbacks of invite requests, in order
	 * @property {{ name: string, open: boolean }} [create] makes the group on sign-in
	 * @property {string} [invite] joins with this invite secret on sign-in
	 * @property {(gid: string) => void} [onWelcome] called once signed in
	 * @property {(why: string) => void} [onFail] called if the sign-in fails
	 * @property {boolean} [dead] closed on purpose (no reconnect)
	 * @property {number} [pinged] last keep-alive
	 * @property {number} [rtt] ms a ping took to come back, averaged
	 * @property {boolean} [old] signs in with the previous keys (prevKey) and hands the group over to the current ones
	 * @property {KeyPair} [key] the keys it signed in with
	 * @property {boolean} [retried] already tried the other keys after 'not a member'
	 */
	/** @type {Record<string, Conn>} One relay connection per group (reconnects with backoff, up to 5 min), by group id. */
	const conns = {};
	/** @type {Record<number, string>} Member number -> picture shared in a group (for members who aren't friends). */
	let relayPics = {};
	/**
	 * This account's keys in this browser: one for signing in (ECDSA) and one for end-to-end encryption (ECDH).
	 * @typedef {object} KeyPair
	 * @property {number} owner member number
	 * @property {CryptoKey} priv
	 * @property {{ x: string, y: string }} pub
	 * @property {string} kf the first 16 chars of pub.x
	 * @property {CryptoKey} epriv the encryption private key
	 * @property {string} ek the encryption public key ("x.y")
	 * @property {KeyJwk} [jwk] the whole keys, when this visit knows them (from the account backup, or made here): only for the backup
	 * @property {Handover} [rk] how the keys before these handed over to them
	 */
	/**
	 * A key pair's coordinates as JWK fields (base64url): x, y, d for signing, ex, ey, ed for encryption.
	 * @typedef {{ x: string, y: string, d: string, ex: string, ey: string, ed: string }} KeyJwk
	 */
	/**
	 * A hand-over to new keys: the old signing key's public half and its signature of
	 * `rekey|<member number>|<new x>|<new y>`. Groups take it with 'rekey'; friends who only know the old key
	 * check the new one with it (followKey).
	 * @typedef {{ x: string, y: string, sig: string }} Handover
	 */
	/**
	 * Keys as IndexedDB keeps them (keyStore): CryptoKeys that can't be exported, and the public halves.
	 * @typedef {{ priv: CryptoKey, epriv: CryptoKey, x: string, y: string, ex: string, ey: string, rk?: Handover }} KeyRecord
	 */
	/** @type {KeyPair | null} Cached result of getKey. */
	let myKey = null;
	/** @type {{ owner: number, p: Promise<KeyPair> } | null} getKey while it runs, so two callers get the same keys. */
	let keyLoading = null;
	/**
	 * The keys this account had before its current ones, after a hand-over (loadKey): kept to sign in to the
	 * groups in `owed` (which still know only them) and hand those over, and to read the mailbox that friends
	 * who don't know the new key yet still fill. `sig` is their signature of the current keys, for 'rekey'.
	 * Dropped once nothing is owed and MAIL_DAYS have passed.
	 * @type {(KeyPair & { at: number, owed: string[], sig: string }) | null}
	 */
	let prevKey = null;
	/** Days the relay keeps a mailbox beep (its MAIL.days), so the previous keys are kept that long. */
	const MAIL_DAYS = 14;
	/** Whether the keys changed this visit, so online SlimeBeep friends are told (relayTick). */
	let keyNews = false;
	/**
	 * Bytes as base64url (no padding).
	 * @param {ArrayBuffer} buf
	 */
	const b64url = (buf) =>
		btoa(String.fromCharCode(...new Uint8Array(buf)))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
	/**
	 * base64url (no padding) as bytes.
	 * @param {string} s
	 */
	const unb64url = (s) =>
		Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

	// ---- End-to-end encryption, with WebCrypto only: ECDH P-256 agrees a secret, HKDF-SHA-256 turns it into
	// an AES-GCM-256 key bound to what it is for (`info`), and AES-GCM seals the data together with `aad`.
	// The relay stores and passes on sealed data it cannot read.

	/**
	 * A sealed message: `iv` the 12-byte nonce and `ct` the ciphertext with its tag, both base64url.
	 * @typedef {object} Sealed
	 * @property {string} iv
	 * @property {string} ct
	 */
	/**
	 * An encryption public key "x.y" as a CryptoKey.
	 * @param {string} ek
	 */
	const ecdhPub = (ek) => {
		const [x, y] = ek.split('.');
		return crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x, y, ext: true }, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
	};
	/**
	 * The AES-GCM key that `priv` and the holder of `ek` both arrive at, for the purpose `info`.
	 * @param {CryptoKey} priv an ECDH private key
	 * @param {string} ek the other side's encryption public key
	 * @param {string} info what the key is for (both sides must use the same)
	 */
	async function agree(priv, ek, info) {
		const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: await ecdhPub(ek) }, priv, 256);
		const hkdf = await crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
		return crypto.subtle.deriveKey(
			{ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode(info) },
			hkdf,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt'],
		);
	}
	/**
	 * Seals bytes with an AES-GCM key; `aad` is checked on opening but not stored.
	 * @param {CryptoKey} key
	 * @param {BufferSource} data
	 * @param {string} aad
	 * @returns {Promise<Sealed>}
	 */
	async function seal(key, data, aad) {
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(aad) }, key, data);
		return { iv: b64url(iv.buffer), ct: b64url(ct) };
	}
	/**
	 * Opens what `seal` made; throws if it was changed or the key or `aad` differ.
	 * @param {CryptoKey} key
	 * @param {Sealed} box
	 * @param {string} aad
	 */
	async function unseal(key, box, aad) {
		const plain = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: unb64url(box.iv), additionalData: new TextEncoder().encode(aad) },
			key,
			unb64url(box.ct),
		);
		return new Uint8Array(plain);
	}
	/**
	 * Verifies an ECDSA P-256 signature (base64url) of `text` with a member's signing key.
	 * @param {{ x: string, y: string }} pub
	 * @param {string} sig
	 * @param {string} text
	 */
	async function verifySig(pub, sig, text) {
		try {
			const key = await crypto.subtle.importKey(
				'jwk',
				{ kty: 'EC', crv: 'P-256', x: pub.x, y: pub.y, ext: true },
				{ name: 'ECDSA', namedCurve: 'P-256' },
				false,
				['verify'],
			);
			return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, unb64url(sig), new TextEncoder().encode(text));
		} catch (e) {
			return false;
		}
	}
	/**
	 * Signs `text` with this account's signing key, or with `k` (base64url).
	 * @param {string} text
	 * @param {KeyPair} [k]
	 */
	async function signText(text, k) {
		const key = k || (await getKey());
		return b64url(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key.priv, new TextEncoder().encode(text)));
	}
	/**
	 * The keys a group knows this account by: the ones its connection signed in with (the previous keys while
	 * it waits to be handed over), else the current ones.
	 * @param {string} gid
	 * @returns {Promise<KeyPair>}
	 */
	const keyFor = (gid) => {
		const c = conns[gid];
		return c && c.key ? Promise.resolve(c.key) : getKey();
	};
	/**
	 * Seals a mailbox beep to friend `to`: a one-time key pair agrees a key with their encryption key, so only
	 * they can open it; the sender and recipient numbers are bound in, so the relay can't pass it off as another's.
	 * @param {number} to
	 * @param {string} text
	 */
	async function sealMail(to, text) {
		const me = Player.MemberNumber;
		const once = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
		const jwk = await crypto.subtle.exportKey('jwk', once.publicKey);
		const key = await agree(once.privateKey, peerEks[to], `slimebeep mail v1|${me}|${to}`);
		return { e: `${jwk.x}.${jwk.y}`, ...(await seal(key, new TextEncoder().encode(text), `${me}|${to}`)) };
	}
	/**
	 * Opens a mailbox beep from `from` sealed with sealMail; throws if it isn't for us or was changed.
	 * @param {number} from
	 * @param {Sealed & { e: string }} enc
	 * @param {KeyPair} [mine] the keys it was addressed to (else the current ones)
	 */
	async function openMail(from, enc, mine) {
		const me = Player.MemberNumber;
		const k = mine || (await getKey());
		const key = await agree(k.epriv, enc.e, `slimebeep mail v1|${from}|${me}`);
		return new TextDecoder().decode(await unseal(key, enc, `${from}|${me}`));
	}

	// ---- Group keys. Each group has one AES key per epoch, made by a member and given to the others as
	// wraps: the key sealed to one member's encryption key and signed by the member who wrapped it. Keys
	// are kept per account in localStorage (slimebeep.gk.<member number>), raw and base64url.

	/** @type {Record<string, Record<number, string>>} Group id -> epoch -> the group key (raw, base64url). */
	let groupKeys = {};
	/** @type {Map<string, CryptoKey>} "<group id>|<epoch>" -> the imported group key. */
	const keyCache = new Map();
	/** @type {Record<string, { epoch: number, rekey: boolean, needs: number[] }>} The latest key state the relay sent per group. */
	const keyState = {};
	/** @type {Map<string, RelayGroupMessage[]>} Group id -> messages waiting for a key we don't have yet. */
	const waitingKey = new Map();
	/** localStorage key of the group keys of the logged-in account. */
	const gkKey = () => `slimebeep.gk.${Player.MemberNumber}`;
	/** The logged-in account's saved group keys. */
	function loadGroupKeys() {
		/** @type {Record<string, Record<number, string>>} */
		const out = {};
		try {
			/** @type {Record<string, Record<string, unknown>>} */
			const saved = JSON.parse(localStorage.getItem(gkKey()) || '{}');
			for (const [gid, eps] of Object.entries(saved)) {
				if (!isId(gid) || !eps || typeof eps !== 'object') {
					continue;
				}
				for (const [e, raw] of Object.entries(eps)) {
					if (Number.isInteger(Number(e)) && typeof raw === 'string' && /^[A-Za-z0-9_-]{43}$/.test(raw)) {
						(out[gid] = out[gid] || {})[Number(e)] = raw;
					}
				}
			}
		} catch (e) {
			/* none */
		}
		return out;
	}
	/** Saves the group keys of the logged-in account. */
	function saveGroupKeys() {
		try {
			localStorage.setItem(gkKey(), JSON.stringify(groupKeys));
		} catch (e) {
			/* this visit only */
		}
	}
	/**
	 * A group's key for an epoch, or null if we don't have it.
	 * @param {string} gid
	 * @param {number} e
	 * @returns {Promise<CryptoKey | null>}
	 */
	async function groupKey(gid, e) {
		const id = `${gid}|${e}`;
		const cached = keyCache.get(id);
		if (cached) {
			return cached;
		}
		const raw = groupKeys[gid] && groupKeys[gid][e];
		if (!raw) {
			return null;
		}
		const key = await crypto.subtle.importKey('raw', unb64url(raw), 'AES-GCM', false, ['encrypt', 'decrypt']);
		keyCache.set(id, key);
		return key;
	}
	/**
	 * Whether a member's encryption key is really theirs: signed with the key they signed in with, and for a
	 * friend, that key is the one their own SlimeBeep told us.
	 * @param {string} gid
	 * @param {GroupMember | undefined} m
	 */
	async function trustedEk(gid, m) {
		if (!m || !m.pub || !m.ek || !m.eks || !EK_RE.test(m.ek)) {
			return false;
		}
		if (!(await knownKey(m))) {
			return false;
		}
		return verifySig(m.pub, m.eks, `ek|${gid}|${m.n}|${m.ek}`);
	}
	/**
	 * Whether a member's key is the one their own SlimeBeep told us, or was handed over from it (then it is
	 * the known one from now on). True when we know none.
	 * @param {GroupMember} m
	 * @returns {Promise<boolean>}
	 */
	async function knownKey(m) {
		const known = peerKeys[m.n];
		if (!known) {
			return true;
		}
		if (!m.pub) {
			return false;
		}
		return known === m.pub.x.slice(0, 16) || followKey(m.n, m.rk, m.pub);
	}
	/**
	 * Follows a friend to new keys: `rk` must come from the key their own SlimeBeep told us (peerKeys) and sign
	 * `pub`. Then `pub` is the key we know for them, and their encryption key is asked for again (askEks).
	 * @param {number} n
	 * @param {Handover | undefined} rk
	 * @param {{ x: string, y: string } | undefined} pub
	 */
	async function followKey(n, rk, pub) {
		if (!rk || !pub || !peerKeys[n] || rk.x.slice(0, 16) !== peerKeys[n]) {
			return false;
		}
		if (!(await verifySig(rk, rk.sig, `rekey|${n}|${pub.x}|${pub.y}`))) {
			return false;
		}
		peerWas[n] = peerKeys[n];
		peerKeys[n] = pub.x.slice(0, 16);
		delete peerEks[n];
		askedEk.delete(n);
		saveGC();
		return true;
	}
	/**
	 * Seals a group key to a member and signs the result.
	 * @param {string} gid
	 * @param {number} e epoch
	 * @param {Uint8Array<ArrayBuffer>} raw the group key
	 * @param {GroupMember} m
	 */
	async function wrapFor(gid, e, raw, m) {
		const me = Player.MemberNumber;
		const k = await keyFor(gid);
		const key = await agree(k.epriv, m.ek || '', `slimebeep group v1|${gid}|${e}|${me}|${m.n}`);
		const box = await seal(key, raw, `${gid}|${e}|${m.n}`);
		return { to: m.n, ...box, sig: await signText(`wrap|${gid}|${e}|${m.n}|${box.iv}|${box.ct}`, k) };
	}
	/**
	 * Opens a wrap of a group key sent to us, after checking the member who made it signed it; keeps the key.
	 * @param {string} gid
	 * @param {number} e epoch
	 * @param {{ to: number, by: number, ek: string, iv: string, ct: string, sig: string }} w
	 */
	async function unwrap(gid, e, w) {
		const g = groups[gid];
		const me = Player.MemberNumber;
		const k = await keyFor(gid);
		const by = g && g.members.find((m) => m.n === w.by);
		if (!g || w.to !== me || w.ek !== k.ek || !by || !by.pub || !(await trustedEk(gid, by))) {
			return false;
		}
		if (!(await verifySig(by.pub, w.sig, `wrap|${gid}|${e}|${me}|${w.iv}|${w.ct}`))) {
			return false;
		}
		const key = await agree(k.epriv, by.ek || '', `slimebeep group v1|${gid}|${e}|${w.by}|${me}`);
		const raw = await unseal(key, w, `${gid}|${e}|${me}`);
		if (raw.length !== 32) {
			return false;
		}
		(groupKeys[gid] = groupKeys[gid] || {})[e] = b64url(raw.buffer);
		saveGroupKeys();
		return true;
	}
	/**
	 * Wraps a group key for members (those whose encryption key checks out) and sends the wraps to the relay.
	 * @param {string} gid
	 * @param {number} e epoch
	 * @param {Uint8Array<ArrayBuffer>} raw
	 * @param {GroupMember[]} members
	 * @param {boolean} fresh this key starts epoch `e`
	 */
	async function sendWraps(gid, e, raw, members, fresh) {
		const wraps = [];
		for (const m of members) {
			if (await trustedEk(gid, m)) {
				wraps.push(await wrapFor(gid, e, raw, m));
			}
		}
		if (wraps.length) {
			relaySend(gid, { t: 'gkey', e, wraps, ...(fresh ? { fresh: true } : {}) });
		}
	}
	/**
	 * The relay's key state for a group: opens our wraps, makes the first key (or a new one after someone
	 * left), and gives the current key to members who don't have it yet. Members online at the same time
	 * may all try; the relay keeps the first, after a random wait to make that rare.
	 * @param {string} gid
	 * @param {RelayMessage} p
	 */
	async function takeKeys(gid, p) {
		const g = groups[gid];
		if (!g || !Number.isInteger(p.epoch)) {
			return;
		}
		const epoch = Number(p.epoch);
		const state = { epoch, rekey: p.rekey === true, needs: Array.isArray(p.needs) ? p.needs.filter(isNum) : [] };
		keyState[gid] = state;
		let got = false;
		for (const x of Array.isArray(p.mine) ? p.mine.slice(0, 20) : []) {
			if (!x || !Number.isInteger(x.e) || !x.w || (groupKeys[gid] && groupKeys[gid][x.e])) {
				continue;
			}
			try {
				got = (await unwrap(gid, x.e, x.w)) || got;
			} catch (e) {
				warn(e, 'key');
			}
		}
		if (got) {
			retryWaiting(gid);
		}
		const mine = groupKeys[gid] && groupKeys[gid][epoch];
		if (epoch === 0 || state.rekey || (mine && state.needs.length)) {
			await new Promise((r) => setTimeout(r, 300 + Math.random() * 1700));
			if (keyState[gid] !== state || !groups[gid]) {
				return;
			}
			if (epoch === 0 || state.rekey) {
				const raw = crypto.getRandomValues(new Uint8Array(32));
				await sendWraps(gid, epoch + 1, raw, groups[gid].members, true);
			} else if (mine) {
				// Newcomers get the older keys we hold too, so they can read the history.
				const needy = groups[gid].members.filter((m) => state.needs.includes(m.n));
				const held = Object.keys(groupKeys[gid] || {})
					.map(Number)
					.filter((e) => e <= epoch)
					.sort((a, b) => b - a);
				for (const e of held) {
					await sendWraps(gid, e, unb64url(groupKeys[gid][e]), needy, false);
				}
			}
		}
	}
	/**
	 * Opens group messages: sealed ones with the key of their epoch (kept waiting if we don't have it yet);
	 * system lines ("X joined") come from the relay as they are.
	 * @param {string} gid
	 * @param {RelayGroupMessage[]} msgs
	 */
	async function openMsgs(gid, msgs) {
		/** @type {RelayGroupMessage[]} */
		const out = [];
		/** @type {RelayGroupMessage[]} */
		const later = [];
		for (const m of msgs.slice(-200)) {
			if (!m || typeof m !== 'object') {
				continue;
			}
			if (m.sys === true) {
				out.push(m);
				continue;
			}
			const enc = m.enc;
			if (!enc || !Number.isInteger(enc.e) || typeof enc.iv !== 'string' || typeof enc.ct !== 'string' || !isNum(m.from)) {
				continue;
			}
			const key = await groupKey(gid, enc.e);
			if (!key) {
				later.push(m);
				continue;
			}
			try {
				const text = new TextDecoder().decode(await unseal(key, enc, `${gid}|${enc.e}|${m.from}`));
				out.push({ ...m, text });
			} catch (e) {
				/* changed or not for this key: dropped */
			}
		}
		if (later.length) {
			const all = [...(waitingKey.get(gid) || []), ...later];
			waitingKey.set(gid, all.slice(-200));
		}
		return out;
	}
	/**
	 * Adds group messages to the chat once they are opened.
	 * @param {string} gid
	 * @param {RelayGroupMessage[] | undefined} msgs
	 * @param {boolean} isLive
	 */
	async function takeSealed(gid, msgs, isLive) {
		if (!Array.isArray(msgs)) {
			return;
		}
		takeMsgs(gid, await openMsgs(gid, msgs), isLive);
		// Messages still waiting for a key are fetched again after a reconnect.
		const waits = waitingKey.get(gid);
		const g = groups[gid];
		if (g && waits && waits.length) {
			g.last = Math.min(g.last || 0, Math.min(...waits.map((m) => m.id)) - 1);
			saveGC();
		}
	}
	/**
	 * Opens the messages that were waiting for a group key we now have.
	 * @param {string} gid
	 */
	function retryWaiting(gid) {
		const waits = waitingKey.get(gid);
		if (!waits || !waits.length) {
			return;
		}
		waitingKey.delete(gid);
		takeSealed(gid, waits, false).catch((e) => warn(e, 'key'));
	}
	/** Group messages are sealed padded to a multiple of this many bytes, so their size says little about them. */
	const PAD = 128;
	/**
	 * A message as UTF-8, padded with NULs to a multiple of PAD bytes (clean strips them when it is read).
	 * @param {string} text
	 */
	const padded = (text) => {
		const bytes = new TextEncoder().encode(text);
		const out = new Uint8Array(Math.ceil((bytes.length + 1) / PAD) * PAD);
		out.set(bytes);
		return out;
	};
	/**
	 * Seals a message with the group's current key and sends it; waits up to 20 s for the key.
	 * @param {string} gid
	 * @param {string} text
	 */
	async function sendGroup(gid, text) {
		konamiText(text);
		const t0 = Date.now();
		let told = false;
		for (;;) {
			const st = keyState[gid];
			const key = st && st.epoch > 0 && !st.rekey ? await groupKey(gid, st.epoch) : null;
			if (st && key) {
				const enc = { e: st.epoch, ...(await seal(key, padded(text), `${gid}|${st.epoch}|${Player.MemberNumber}`)) };
				relaySend(gid, { t: 'say', enc });
				return;
			}
			if (Date.now() - t0 > 20000 || !groups[gid]) {
				notify("🔒 Not sent: the group key hasn't reached you yet. It comes when another member is online.");
				return;
			}
			if (!told) {
				told = true;
				notify('🔒 Getting the group key…');
			}
			await new Promise((r) => setTimeout(r, 500));
		}
	}

	/** Whether this page can sign in to the relay: WebCrypto (crypto.subtle) exists only on https pages. */
	const secure = () => typeof crypto !== 'undefined' && !!crypto.subtle;
	/** This page's address over https. */
	const httpsUrl = () => location.href.replace(/^http:/, 'https:');
	/** Whether needHttps has shown its card. */
	let httpsTold = false;
	/** On an http page: tells the player, once per visit, that group chats and mailboxes need the https address. */
	function needHttps() {
		if (httpsTold) {
			return;
		}
		httpsTold = true;
		card({
			icon: logoIcon(),
			title: '🔒 SlimeBeep',
			text: 'Group chats need the secure (https) address of the game. Tap to open it; you will log in again there.',
			ms: 0,
			cls: 'news',
			onClick: () => {
				location.href = httpsUrl();
			},
		});
	}

	/** Whether relayBlocked has shown its card. */
	let blockTold = false;
	/** Whether any relay connection has opened this visit (then nothing is blocking it). */
	let relayReached = false;
	/** Relay connections in a row that closed without opening. */
	let relayMisses = 0;
	/** A relay connection opened: whatever failed before was a passing drop. */
	function relayOpened() {
		relayReached = true;
		relayMisses = 0;
	}
	/**
	 * A relay connection closed without ever opening. Once is a dropped connection (a reconnect, a laptop
	 * waking up); three in a row with none ever opening means something on the player's side (NoScript,
	 * uMatrix, a strict blocker or firewall) stops it. Tells them, once per visit, what to allow.
	 */
	function relayBlocked() {
		if (blockTold || relayReached || !opts.relayWarn || !navigator.onLine || ++relayMisses < 3) {
			return;
		}
		blockTold = true;
		card({
			icon: logoIcon(),
			title: '🛡 SlimeBeep',
			text: `Group chats can't reach SlimeBeep's server. If you use NoScript, uMatrix or another blocker, allow ${RELAY.replace('wss://', '')} and reload.`,
			sub: 'Click to not show this again',
			ms: 0,
			cls: 'news',
			onClick: () => {
				setOpt('relayWarn', false);
				notify("✓ That message won't show again");
			},
		});
	}

	/**
	 * Opens a signed connection to `owner`'s mailbox on the relay. Mailboxes hold beeps for offline
	 * SlimeBeep friends, addressed to the recipient's key start (peerKeys); see relay/src/index.js.
	 * @param {number} owner the mailbox's member number (yours to read, a friend's to leave a beep)
	 * @param {(p: RelayMessage, ws: WebSocket) => void} onMsg gets every message from the relay
	 * @param {KeyPair} [key] the keys to sign in with (else the current ones; their hand-over goes along, see followKey)
	 * @returns {Promise<WebSocket>} resolves once signed in
	 */
	function mailOpen(owner, onMsg, key) {
		return new Promise((resolve, reject) => {
			/** @type {WebSocket | null} */
			let ws = null;
			let done = false;
			/** @param {string | null} err why it failed, or null once signed in */
			const fin = (err) => {
				if (done) {
					return;
				}
				done = true;
				clearTimeout(timer);
				if (!err && ws) {
					resolve(ws);
					return;
				}
				try {
					if (ws) {
						ws.close();
					}
				} catch (e) {
					/* gone */
				}
				reject(new Error(err || 'closed'));
			};
			const timer = setTimeout(() => fin('no answer'), 10000);
			/** @type {WebSocket} */
			let sock;
			try {
				sock = new WebSocket(`${relayUrl()}/ws?m=${owner}`);
			} catch (e) {
				fin('could not connect');
				return;
			}
			ws = sock;
			sock.onmessage = async (e) => {
				/** @type {RelayMessage | null} */
				let p;
				try {
					p = JSON.parse(e.data);
				} catch (x) {
					return;
				}
				if (!p || typeof p !== 'object') {
					return;
				}
				if (p.t === 'hello' && typeof p.nonce === 'string') {
					try {
						const k = key || (await getKey());
						const me = Player.MemberNumber;
						const signed = `${p.nonce}|mbox:${owner}|${me}`;
						const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k.priv, new TextEncoder().encode(signed));
						sock.send(
							JSON.stringify({ t: 'auth', member: me, name: myName(), pub: k.pub, sig: b64url(sig), ...(k.rk ? { rk: k.rk } : {}) }),
						);
					} catch (x) {
						fin('could not sign in');
					}
					return;
				}
				if (p.t === 'error' && p.fatal) {
					fin(clean(p.why, 80) || 'refused');
					return;
				}
				if (p.t === 'welcome' || p.t === 'mail') {
					fin(null);
				}
				try {
					onMsg(p, sock);
				} catch (x) {
					warn(x, 'mail');
				}
			};
			let opened = false;
			sock.onopen = () => {
				opened = true;
				relayOpened();
			};
			sock.onclose = () => {
				if (!opened) {
					relayBlocked();
				}
				fin('closed');
			};
		});
	}
	/** True while mailWaiting runs. */
	let mailing = false;
	/**
	 * Leaves `waiting` beeps for SlimeBeep friends in their mailboxes; delivered ones move to `hist` (📬).
	 * A beep is retried after 10 minutes, or straight away with `now`.
	 * @param {boolean} [now]
	 */
	async function mailWaiting(now = false) {
		if (mailing || !loggedIn() || !waiting.length || !secure()) {
			return;
		}
		const due = waiting.filter((w) => peers.has(w.n) && peerKeys[w.n] && peerEks[w.n] && (now || Date.now() - (w.tried || 0) > 600000));
		if (!due.length) {
			return;
		}
		mailing = true;
		try {
			for (const n of [...new Set(due.map((w) => w.n))]) {
				const mine = due.filter((w) => w.n === n).slice(0, 15);
				for (const w of mine) {
					w.tried = Date.now();
				}
				/** @type {Map<string, boolean>} beep id -> left in the mailbox */
				const answers = new Map();
				let ws;
				try {
					ws = await mailOpen(n, (p) => {
						if ((p.t === 'ok' || p.t === 'error') && typeof p.ref === 'string') {
							answers.set(p.ref, p.t === 'ok');
						}
					});
				} catch (e) {
					continue;
				}
				for (const w of mine) {
					ws.send(JSON.stringify({ t: 'put', kf: peerKeys[n], enc: await sealMail(n, w.text), ref: w.id }));
				}
				const t0 = Date.now();
				while (Date.now() - t0 < 8000 && mine.some((w) => !answers.has(w.id))) {
					await new Promise((r) => setTimeout(r, 100));
				}
				try {
					ws.close();
				} catch (e) {
					/* gone */
				}
				const left = mine.filter((w) => answers.get(w.id) === true && waiting.includes(w));
				if (!left.length) {
					continue;
				}
				waiting = waiting.filter((w) => !left.includes(w));
				for (const w of left) {
					const k = `mail:${w.id}`;
					if (histKeys.has(k)) {
						continue;
					}
					hist.push({ k, MemberNumber: n, MemberName: nameOf(n), Sent: true, Time: w.at, Message: w.text, mail: true });
					histKeys.add(k);
				}
				hist.sort((a, b) => a.Time - b.Time);
				saveHistory();
				saveWaiting();
				notify(`📬 Left in ${nameOf(n)}'s mailbox: they get it when they log in`);
				if (isOpen()) {
					render(true);
				}
			}
		} finally {
			mailing = false;
		}
	}
	/** When your mailbox was last checked. */
	let mailChecked = 0;
	/** True while checkMail runs. */
	let mailBusy = false;
	/**
	 * Fetches your mailbox (at login, then every 5 minutes from relayTick): the beeps for your keys and, after a
	 * hand-over, those still left for your previous ones.
	 */
	async function checkMail() {
		if (mailBusy || !loggedIn() || !secure()) {
			return;
		}
		mailBusy = true;
		mailChecked = Date.now();
		try {
			const keys = [await getKey()];
			if (prevKey && prevKey.owner === Player.MemberNumber) {
				keys.push(prevKey);
			}
			for (const k of keys) {
				try {
					const ws = await mailOpen(
						Player.MemberNumber,
						(p, sock) => {
							if (p.t === 'mail') {
								takeMail(p.list, sock, k).catch((e) => warn(e, 'mail'));
							}
						},
						k,
					);
					setTimeout(() => {
						try {
							ws.close();
						} catch (e) {
							/* gone */
						}
					}, 3000);
				} catch (e) {
					/* tried again next time */
				}
			}
		} catch (e) {
			/* tried again next time */
		} finally {
			mailBusy = false;
		}
	}
	/**
	 * Opens mailbox beeps, adds them to `hist` and acks them. Beeps from non-friends, with a wrong sender key (one
	 * not handed over from the key we know, see followKey) or that don't open with our encryption key are dropped.
	 * @param {MailItem[] | undefined} list
	 * @param {WebSocket} sock
	 * @param {KeyPair} [mine] the keys the mailbox connection signed in with
	 */
	async function takeMail(list, sock, mine) {
		if (!Array.isArray(list) || !list.length) {
			return;
		}
		/** @type {string[]} */
		const ids = [];
		/** @type {HistEntry[]} */
		const fresh = [];
		for (const m of list.slice(0, 100)) {
			if (!m || typeof m.id !== 'string' || !/^[A-Z2-9]{10}$/.test(m.id)) {
				continue;
			}
			ids.push(m.id);
			const from = m.from;
			if (!isNum(from) || from === Player.MemberNumber || !isFriend(from)) {
				continue;
			}
			// Signed with another key than the one their own SlimeBeep sent us (or the one before it, which they left beeps
			// with before they moved), and not handed over from it: not from them.
			const known = peerKeys[from];
			if (
				known &&
				known !== m.fromKf &&
				peerWas[from] !== m.fromKf &&
				!(m.pub && m.pub.x.slice(0, 16) === m.fromKf && (await followKey(from, m.rk, m.pub)))
			) {
				continue;
			}
			let text = '';
			try {
				text = m.enc && EK_RE.test(m.enc.e) ? (await openMail(from, m.enc, mine)).slice(0, 1000) : '';
			} catch (e) {
				text = '';
			}
			const k = `mail:${m.id}`;
			if (!text.trim() || histKeys.has(k) || deletedKeys.has(k)) {
				continue;
			}
			const h = {
				k,
				MemberNumber: from,
				MemberName: nameOf(from) || clean(m.name, LIMITS.name) || `#${from}`,
				Sent: false,
				Time: Number(m.at) || Date.now(),
				Message: text,
				mail: true,
				unread: true,
				...(known ? {} : { unchecked: true }),
			};
			hist.push(h);
			histKeys.add(k);
			fresh.push(h);
		}
		if (fresh.length) {
			hist.sort((a, b) => a.Time - b.Time);
			saveHistory();
			ding(fresh);
			for (const h of fresh.slice(-3)) {
				announce(h);
			}
			if (isOpen() && tab !== 'wave') {
				render(true);
			}
		}
		if (ids.length) {
			try {
				sock.send(JSON.stringify({ t: 'ack', ids }));
			} catch (e) {
				/* again next time */
			}
		}
	}

	/**
	 * Runs one request on SlimeBeep's IndexedDB store of private keys and resolves with its result once saved.
	 * @param {(store: IDBObjectStore) => IDBRequest} fn
	 * @returns {Promise<any>}
	 */
	const keyStore = (fn) =>
		new Promise((resolve, reject) => {
			const open = indexedDB.open('slimebeep', 1);
			open.onupgradeneeded = () => open.result.createObjectStore('keys');
			open.onerror = () => reject(open.error);
			open.onsuccess = () => {
				const db = open.result;
				const tx = db.transaction('keys', 'readwrite');
				const req = fn(tx.objectStore('keys'));
				tx.oncomplete = () => {
					db.close();
					resolve(req.result);
				};
				tx.onerror = tx.onabort = () => {
					db.close();
					reject(tx.error);
				};
			};
		});
	/**
	 * This account's keys in this browser; made on first use. The private keys are CryptoKeys that can't be
	 * exported, kept in IndexedDB (keyStore, "key.<member number>"); localStorage keeps the public halves under
	 * slimebeep.key.<member number> (x, y for signing; ex, ey for encryption). Keys from older versions, kept
	 * whole in localStorage (d, ed), move there; without IndexedDB they stay as they were. `kf` is the first
	 * 16 chars of the signing key's public x, the fingerprint friends compare. Where the game keeps add-on
	 * settings in the account, the keys are backed up there too (see loadKey and writeBackup).
	 * @returns {Promise<KeyPair>}
	 */
	function getKey() {
		const me = Player.MemberNumber;
		if (myKey && myKey.owner === me) {
			return Promise.resolve(myKey);
		}
		if (!keyLoading || keyLoading.owner !== me) {
			keyLoading = { owner: me, p: loadKey(me) };
			keyLoading.p.catch(() => {
				keyLoading = null;
			});
		}
		return keyLoading.p;
	}
	/** A new key pair (signing and encryption), as JWK fields. */
	async function newJwk() {
		const sign = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
		const s = await crypto.subtle.exportKey('jwk', sign.privateKey);
		const enc = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
		const e = await crypto.subtle.exportKey('jwk', enc.privateKey);
		return { x: s.x || '', y: s.y || '', d: s.d || '', ex: e.x || '', ey: e.y || '', ed: e.d || '' };
	}
	/**
	 * Keys from JWK fields, imported so they can't be exported again.
	 * @param {number} me
	 * @param {KeyJwk} jwk
	 * @param {Handover} [rk]
	 * @returns {Promise<KeyPair>}
	 */
	async function importPair(me, jwk, rk) {
		const b64 = /^[A-Za-z0-9_-]{40,50}$/;
		if (![jwk.x, jwk.y, jwk.d, jwk.ex, jwk.ey, jwk.ed].every((v) => typeof v === 'string' && b64.test(v))) {
			throw new Error('bad keys');
		}
		const priv = await crypto.subtle.importKey(
			'jwk',
			{ kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, d: jwk.d, ext: true },
			{ name: 'ECDSA', namedCurve: 'P-256' },
			false,
			['sign'],
		);
		const epriv = await crypto.subtle.importKey(
			'jwk',
			{ kty: 'EC', crv: 'P-256', x: jwk.ex, y: jwk.ey, d: jwk.ed, ext: true },
			{ name: 'ECDH', namedCurve: 'P-256' },
			false,
			['deriveBits'],
		);
		const { x, y, d, ex, ey, ed } = jwk;
		return {
			owner: me,
			priv,
			pub: { x, y },
			kf: x.slice(0, 16),
			epriv,
			ek: `${ex}.${ey}`,
			jwk: { x, y, d, ex, ey, ed },
			...(rk ? { rk } : {}),
		};
	}
	/**
	 * Keys from what IndexedDB keeps.
	 * @param {number} me
	 * @param {KeyRecord} r
	 * @returns {KeyPair}
	 */
	const fromRecord = (me, r) => ({
		owner: me,
		priv: r.priv,
		pub: { x: r.x, y: r.y },
		kf: r.x.slice(0, 16),
		epriv: r.epriv,
		ek: `${r.ex}.${r.ey}`,
		...(r.rk ? { rk: r.rk } : {}),
	});
	/**
	 * What IndexedDB keeps of keys.
	 * @param {KeyPair} k
	 * @returns {KeyRecord}
	 */
	const toRecord = (k) => {
		const [ex, ey] = k.ek.split('.');
		return { priv: k.priv, epriv: k.epriv, x: k.pub.x, y: k.pub.y, ex, ey, ...(k.rk ? { rk: k.rk } : {}) };
	};
	/**
	 * Loads or makes the keys of member `me` (see getKey), once per visit and before any group connects.
	 *
	 * Where the game keeps add-on settings in the account, the keys are also backed up there (writeBackup), and
	 * the backup read here decides which keys this browser uses:
	 * - no keys here: the backup's (a wiped or new browser gets everything back), or new ones;
	 * - the same keys in both: nothing to do;
	 * - other keys here: the backup's win, so a new browser never overwrites the account's keys with its own.
	 *   With no backup, keys that can be exported are backed up as they are; ones that can't (3.7.0's) are
	 *   replaced by new ones that can. Either way the groups this browser is in are handed over to the new keys
	 *   (a 'rekey' signed by the old ones, see connectGroup), and the old keys are kept (prevKey) until every
	 *   group took it, so no group is ever left without keys that work in it.
	 * Whole keys stay in IndexedDB ("jwk.<member number>") only until the account is seen to have them.
	 * @param {number} me
	 * @returns {Promise<KeyPair>}
	 */
	async function loadKey(me) {
		const k = `slimebeep.key.${me}`;
		if (!secure()) {
			throw new Error('no WebCrypto on this page (http)');
		}
		// The groups this browser is in, before any are handed over.
		if (histOwner !== me) {
			loadHistory();
		}
		/** @type {{ x?: string, y?: string, d?: string, ex?: string, ey?: string, ed?: string } | null} */
		let saved = null;
		try {
			saved = JSON.parse(localStorage.getItem(k) || 'null');
		} catch (e) {
			saved = null;
		}
		/** @type {KeyRecord | null} */
		let stored = null;
		/** @type {(KeyRecord & { at: number, owed: string[], sig?: string }) | null} */
		let prev = null;
		/** @type {KeyJwk | null} Whole keys made here that the account wasn't seen to have yet. */
		let unsaved = null;
		let idb = true;
		try {
			stored = await keyStore((st) => st.get(`key.${me}`));
			prev = await keyStore((st) => st.get(`prev.${me}`));
			unsaved = await keyStore((st) => st.get(`jwk.${me}`));
		} catch (e) {
			idb = false;
			stored = null;
		}
		const backup = canBackup() ? readBackup() : null;
		/** @type {KeyPair | null} The backup's keys. */
		let theirs = null;
		if (backup && backup.k) {
			theirs = await importPair(me, backup.k, backup.rk).catch(() => null);
		}
		/** @type {KeyPair | null} This browser's keys. */
		let mine = null;
		if (stored && stored.priv && stored.epriv && (!saved || !saved.x || saved.x === stored.x)) {
			mine = fromRecord(me, stored);
			if (unsaved && unsaved.x === stored.x) {
				mine.jwk = unsaved;
			}
		} else if (saved && saved.x && saved.y && saved.d) {
			const all = { x: saved.x, y: saved.y, d: saved.d, ex: saved.ex || '', ey: saved.ey || '', ed: saved.ed || '' };
			// Keys made before end-to-end encryption get their encryption key now.
			if (!all.ex || !all.ey || !all.ed) {
				const { ex, ey, ed } = await newJwk();
				Object.assign(all, { ex, ey, ed });
			}
			mine = await importPair(me, all);
		}
		const owing = !!prev && prev.owed.length > 0 && (!mine || prev.x !== mine.pub.x);
		/** @type {KeyPair} */
		let key;
		/** @type {KeyPair | null} Keys being handed over from. */
		let from = null;
		if (!mine) {
			key = theirs || (await importPair(me, await newJwk()));
		} else if (theirs && theirs.pub.x === mine.pub.x) {
			key = { ...mine, jwk: theirs.jwk, ...(theirs.rk ? { rk: theirs.rk } : {}) };
		} else if (idb && canBackup() && (theirs || !mine.jwk) && !owing) {
			key = theirs || (await importPair(me, await newJwk()));
			from = mine;
		} else {
			key = mine;
		}
		/** @type {string[]} */
		const owed = from ? Object.keys(groups) : [];
		let sig = '';
		if (from) {
			const text = `rekey|${me}|${key.pub.x}|${key.pub.y}`;
			sig = b64url(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, from.priv, new TextEncoder().encode(text)));
			// The backup's keys keep their own hand-over (from the keys friends most likely know); new keys get this one.
			if (!key.rk) {
				key.rk = { x: from.pub.x, y: from.pub.y, sig };
			}
		}
		let kept = !!stored && stored.x === key.pub.x && !from;
		if (idb && !kept) {
			const was = from;
			try {
				// One transaction: the new keys and the old ones they hand over from are saved together, or neither.
				await keyStore((st) => {
					if (was) {
						st.put({ ...toRecord(was), at: Date.now(), owed, sig }, `prev.${me}`);
					}
					return st.put(toRecord(key), `key.${me}`);
				});
				const back = await keyStore((st) => st.get(`key.${me}`));
				kept = !!back && back.x === key.pub.x && !!back.priv && !!back.epriv;
			} catch (e) {
				kept = false;
			}
		}
		if (from && !kept) {
			// Not saved: keep the keys this browser had, where they were.
			key = from;
			from = null;
			kept = !!stored && stored.x === key.pub.x;
		}
		const [ex, ey] = key.ek.split('.');
		/** @type {Record<string, string>} What localStorage keeps: the public halves, or everything without IndexedDB. */
		const keep = kept || !key.jwk ? { x: key.pub.x, y: key.pub.y, ex, ey } : key.jwk;
		if (!saved || JSON.stringify(saved) !== JSON.stringify(keep)) {
			try {
				localStorage.setItem(k, JSON.stringify(keep));
			} catch (e) {
				/* this visit only */
			}
		}
		// The backup may be written only with these keys in it, and never over the account's other keys.
		const backupOk = canBackup() && !!key.jwk && (!theirs || theirs.pub.x === key.pub.x);
		if (idb && kept && canBackup()) {
			const confirmed = !!theirs && theirs.pub.x === key.pub.x;
			const whole = key.jwk;
			try {
				if (confirmed && unsaved) {
					await keyStore((st) => st.delete(`jwk.${me}`));
				} else if (!confirmed && whole && (!unsaved || unsaved.x !== whole.x)) {
					await keyStore((st) => st.put(whole, `jwk.${me}`));
				}
			} catch (e) {
				/* written again next time */
			}
		}
		prevKey = null;
		if (from) {
			prevKey = { ...from, jwk: undefined, at: Date.now(), owed, sig };
			keyNews = true;
		} else if (prev && prev.priv && prev.x !== key.pub.x) {
			if (!prev.owed.length && Date.now() - prev.at > MAIL_DAYS * 864e5) {
				keyStore((st) => st.delete(`prev.${me}`)).catch(() => {
					/* again next time */
				});
			} else {
				prevKey = { ...fromRecord(me, prev), at: prev.at, owed: prev.owed.slice(), sig: prev.sig || '' };
			}
		}
		if (backup && (!backup.k || backupOk)) {
			takeBackup(backup);
		}
		backupFor = backupOk ? me : null;
		myKey = key;
		writeBackup();
		return key;
	}
	/**
	 * A group now knows this account by its current keys (it took the hand-over, or already had them, or is gone):
	 * nothing more is owed to it.
	 * @param {string} gid
	 */
	function keyMoved(gid) {
		const p = prevKey;
		if (!p || p.owner !== Player.MemberNumber || !p.owed.includes(gid)) {
			return;
		}
		p.owed = p.owed.filter((x) => x !== gid);
		const me = p.owner;
		keyStore((st) => st.put({ ...toRecord(p), at: p.at, owed: p.owed, sig: p.sig }, `prev.${me}`)).catch(() => {
			/* asked again next time */
		});
	}

	// ---- The account backup: the keys, the groups and your picture, in the game's add-on settings
	// (Player.ExtensionSettings.SlimeBeep, synced with the account), so wiping the browser or moving to another
	// one loses nothing. Whoever can read the account can read the keys: that was chosen over losing them.

	/** The key of the backup in Player.ExtensionSettings. */
	const BACKUP = 'SlimeBeep';
	/**
	 * The backup, before LZString packs it.
	 * @typedef {object} Backup
	 * @property {1} v format
	 * @property {KeyJwk} [k] the keys
	 * @property {Handover} [rk] how the keys before them handed over to them
	 * @property {[string, string][]} [g] the groups you are in: id and name
	 * @property {Picture | 0} [p] your picture
	 */
	/** @type {number | null} The account whose backup may be written (loadKey decides, once its keys are loaded). */
	let backupFor = null;
	/** The timer of a backup waiting to be written (saveBackup). */
	let backupTimer = 0;
	/** Whether the game keeps add-on settings in the account here. */
	const canBackup = () =>
		loggedIn() &&
		!!Player.ExtensionSettings &&
		typeof Player.ExtensionSettings === 'object' &&
		typeof ServerPlayerExtensionSettingsSync === 'function';
	/** Whether the game's LZString is there to pack the backup. */
	const hasLz = () => typeof LZString !== 'undefined' && !!LZString && typeof LZString.compressToUTF16 === 'function';
	/**
	 * The account's backup as the game loaded it, or null.
	 * @returns {Backup | null}
	 */
	function readBackup() {
		const raw = Player.ExtensionSettings && Player.ExtensionSettings[BACKUP];
		if (typeof raw !== 'string' || !raw) {
			return null;
		}
		try {
			// Packed with LZString, or plain JSON where the game had none.
			const text = raw[0] === '{' ? raw : hasLz() && LZString.decompressFromUTF16(raw);
			/** @type {Partial<Backup> | null} */
			const b = JSON.parse(text || 'null');
			return b && typeof b === 'object' && b.v === 1 ? /** @type {Backup} */ (b) : null;
		} catch (e) {
			return null;
		}
	}
	/**
	 * Adds the backup's groups and picture to this browser's: groups you aren't in here yet (their relay sends
	 * the rest once connected), and your picture if this browser has none.
	 * @param {Backup} b
	 */
	function takeBackup(b) {
		const me = Player.MemberNumber;
		for (const x of Array.isArray(b.g) ? b.g.slice(0, LIMITS.groups) : []) {
			const id = Array.isArray(x) ? x[0] : null;
			if (!isId(id) || groups[id] || Object.keys(groups).length >= LIMITS.groups) {
				continue;
			}
			groups[id] = {
				id,
				name: clean(x[1], LIMITS.name) || 'Group chat',
				owner: 0,
				admins: [],
				open: false,
				members: [{ n: me, name: myName(), kf: '' }],
				last: 0,
			};
		}
		saveGC();
		const p = b.p;
		if (p && isId(p.v) && typeof p.data === 'string' && p.data.length <= PFP_MAX && PFP_RE.test(p.data) && !myPfp()) {
			setMyPfp({ v: p.v, data: p.data });
		}
	}
	/** Writes the backup in a few seconds (changes close together go as one). */
	function saveBackup() {
		if (backupFor === null || backupFor !== Player.MemberNumber || backupTimer) {
			return;
		}
		backupTimer = window.setTimeout(() => {
			backupTimer = 0;
			writeBackup();
		}, 3000);
	}
	/** Writes the backup to the account, unless it is the same as the account has. */
	function writeBackup() {
		const me = Player.MemberNumber;
		const k = myKey;
		const settings = Player.ExtensionSettings;
		if (!canBackup() || !settings || backupFor !== me || !k || k.owner !== me || !k.jwk) {
			return;
		}
		const pic = myPfp();
		/** @type {Backup} */
		const b = { v: 1, k: k.jwk, ...(k.rk ? { rk: k.rk } : {}), g: Object.values(groups).map((g) => [g.id, g.name]), p: pic || 0 };
		const json = JSON.stringify(b);
		const packed = hasLz() ? LZString.compressToUTF16(json) : json;
		if (settings[BACKUP] === packed) {
			return;
		}
		settings[BACKUP] = packed;
		try {
			ServerPlayerExtensionSettingsSync(BACKUP);
		} catch (e) {
			warn(e, 'backup');
		}
	}

	/**
	 * Opens (or returns) the relay connection for a group.
	 * @param {string} gid
	 * @param {Partial<Conn>} [extra] fields for the connection record, such as `create` or `invite` for the sign-in
	 * @returns {Conn}
	 */
	function connectGroup(gid, extra = {}) {
		if (!secure()) {
			return { ws: null, ready: false, queue: [], waiters: [], dead: true };
		}
		const old = conns[gid];
		if (old && !extra.create && !extra.invite && old.ws && old.ws.readyState <= 1) {
			return old;
		}
		if (old && old.ws) {
			old.dead = true;
			try {
				old.ws.close();
			} catch (e) {
				/* gone */
			}
		}
		// A group still owed a hand-over is signed in to with the previous keys (see loadKey).
		const owed = !extra.create && !extra.invite && !!prevKey && prevKey.owner === Player.MemberNumber && prevKey.owed.includes(gid);
		/** @type {Conn} */
		const c = { ws: null, ready: false, retry: old ? old.retry || 0 : 0, queue: [], waiters: [], old: owed, ...extra };
		conns[gid] = c;
		/** @type {WebSocket} */
		let sock;
		try {
			sock = new WebSocket(`${relayUrl()}/ws?g=${gid}`);
		} catch (e) {
			warn(e, 'relay');
			return c;
		}
		c.ws = sock;
		let opened = false;
		sock.onopen = () => {
			opened = true;
			relayOpened();
		};
		sock.onmessage = (e) => {
			/** @type {RelayMessage} */
			let p;
			try {
				p = JSON.parse(e.data);
			} catch (x) {
				return;
			}
			onRelay(gid, c, p).catch((x) => warn(x, 'relay'));
		};
		sock.onclose = () => {
			c.ready = false;
			if (c.dead || conns[gid] !== c) {
				return;
			}
			if (!opened) {
				relayBlocked();
			}
			if (!groups[gid]) {
				if (c.onFail) {
					c.onFail(opened ? 'could not reach the group' : "could not reach SlimeBeep's server");
				}
				delete conns[gid];
				return;
			}
			// Reconnect after ~2 s, 4 s, 8 s... up to 5 min, with jitter.
			c.retry = Math.min((c.retry || 0) + 1, 8);
			const ms = Math.min(300000, 1000 * 2 ** c.retry) * (0.75 + Math.random() / 2);
			setTimeout(() => {
				if (conns[gid] === c && groups[gid] && loggedIn()) {
					connectGroup(gid);
				}
			}, ms);
		};
		return c;
	}
	/**
	 * Sends to a group's relay connection, or queues it until signed in.
	 * @param {string} gid
	 * @param {object} x the message (JSON)
	 */
	function relaySend(gid, x) {
		const c = conns[gid] || connectGroup(gid);
		if (c.ready && c.ws && c.ws.readyState === 1) {
			c.ws.send(JSON.stringify(x));
		} else {
			c.queue.push(x);
		}
	}

	/**
	 * Handles one message from a group's relay connection (sign-in, roster, messages, pictures, invites, errors).
	 * @param {string} gid
	 * @param {Conn} c
	 * @param {RelayMessage} p
	 */
	async function onRelay(gid, c, p) {
		if (!p || typeof p !== 'object' || conns[gid] !== c) {
			return;
		}
		const me = Player.MemberNumber;
		const ws = c.ws;
		if (!ws) {
			return;
		}
		if (p.t === 'hello' && typeof p.nonce === 'string') {
			const k = c.old && prevKey ? prevKey : await getKey();
			c.key = k;
			const signed = `${p.nonce}|${gid}|${me}`;
			const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k.priv, new TextEncoder().encode(signed));
			const g = groups[gid];
			ws.send(
				JSON.stringify({
					t: 'auth',
					member: me,
					name: myName(),
					pub: k.pub,
					sig: b64url(sig),
					ek: k.ek,
					eks: await signText(`ek|${gid}|${me}|${k.ek}`, k),
					after: g ? g.last || 0 : 0,
					...(c.create ? { create: c.create } : {}),
					...(c.invite ? { invite: c.invite } : {}),
				}),
			);
			return;
		}
		if (p.t === 'welcome') {
			c.ready = true;
			c.retry = 0;
			takeRoster(gid, p.roster);
			const g = groups[gid];
			const pic = myPfp();
			if (g && (pic ? g.picv !== pic.v : g.picv)) {
				ws.send(JSON.stringify({ t: 'profile', pic: pic ? pic.data : null }));
				g.picv = pic ? pic.v : undefined;
				saveGC();
			}
			const st = myStatus();
			if (st.t || st.l || st.a.length) {
				ws.send(JSON.stringify({ t: 'status', s: st }));
			}
			const done = c.onWelcome;
			c.create = undefined;
			c.invite = undefined;
			c.onWelcome = undefined;
			c.onFail = undefined;
			for (const x of c.queue.splice(0)) {
				ws.send(JSON.stringify(x));
			}
			if (done) {
				done(gid);
			}
			const cur = myKey;
			const was = prevKey;
			if (!c.old) {
				keyMoved(gid);
			} else if (cur && cur.owner === me && was && c.key === was && was.sig) {
				// Signed in with the previous keys: the group now takes the current ones, signed over by those.
				ws.send(
					JSON.stringify({ t: 'rekey', pub: cur.pub, sig: was.sig, ek: cur.ek, eks: await signText(`ek|${gid}|${me}|${cur.ek}`, cur) }),
				);
			}
			return;
		}
		if (p.t === 'rekeyed') {
			if (myKey && p.x === myKey.pub.x) {
				keyMoved(gid);
				// Signed in again with the keys the group knows now.
				c.dead = true;
				try {
					ws.close();
				} catch (e) {
					/* gone */
				}
				delete conns[gid];
				connectGroup(gid, { waiters: c.waiters });
			}
			return;
		}
		if (p.t === 'roster') {
			return takeRoster(gid, p.roster);
		}
		if (p.t === 'presence') {
			if (groups[gid] && Array.isArray(p.online)) {
				groups[gid].online = p.online.filter(isNum).slice(0, LIMITS.members);
				emit('presence', groupView(groups[gid]));
				if (isOpen()) {
					render(true);
				}
			}
			return;
		}
		if (p.t === 'msg') {
			if (p.m) {
				await takeSealed(gid, [p.m], true);
			}
			return;
		}
		if (p.t === 'history') {
			return takeSealed(gid, p.msgs, false);
		}
		if (p.t === 'keys') {
			return takeKeys(gid, p);
		}
		if (p.t === 'pic') {
			if (isNum(p.n) && (p.data === null || (typeof p.data === 'string' && p.data.length <= PFP_MAX && PFP_RE.test(p.data)))) {
				if (p.data) {
					relayPics[p.n] = p.data;
				} else {
					delete relayPics[p.n];
				}
				if (isOpen()) {
					render(true);
				}
			}
			return;
		}
		if (p.t === 'gpic') {
			const g = groups[gid];
			if (g && (p.data === null || (typeof p.data === 'string' && p.data.length <= PFP_MAX && PFP_RE.test(p.data)))) {
				if (p.data) {
					g.pic = p.data;
				} else {
					delete g.pic;
				}
				saveGC();
				emit('group', groupView(g));
				if (isOpen()) {
					render(true);
				}
			}
			return;
		}
		if (p.t === 'music') {
			if (p.music === null && isNum(p.by)) {
				takeJam(`g:${gid}`, p.by, '', null);
			} else if (p.music && isNum(p.music.by) && p.music.by !== me) {
				takeJam(`g:${gid}`, p.music.by, p.music.name, p.music, p.age, relayLag(gid));
			}
			return;
		}
		if (p.t === 'status' && isNum(p.n) && p.n !== me) {
			takeStatus(p.n, p.s);
			return;
		}
		if (p.t === 'statuses' && Array.isArray(p.list)) {
			for (const x of /** @type {{ n?: unknown, s?: unknown }[]} */ (/** @type {unknown} */ (p.list)).slice(0, LIMITS.members)) {
				if (x && isNum(x.n) && x.n !== me) {
					takeStatus(/** @type {number} */ (x.n), x.s);
				}
			}
			return;
		}
		if (p.t === 'musicListeners') {
			takeEars(`g:${gid}`, /** @type {unknown} */ (p.list));
			return;
		}
		if (p.t === 'musicQueue') {
			const j = jams.get(`g:${gid}`);
			takeQueue(`g:${gid}`, j ? j.host : 0, p.q);
			return;
		}
		if ((p.t === 'musicAdd' || p.t === 'musicSkip') && isNum(p.by)) {
			if (p.t === 'musicAdd') {
				takeAdd(`g:${gid}`, p.by, p.u, p.ti);
			} else {
				takeSkip(`g:${gid}`, p.by, p.id);
			}
			return;
		}
		if (p.t === 'pong') {
			if (c.pinged) {
				const rtt = Math.min(2000, Date.now() - c.pinged);
				c.rtt = c.rtt ? c.rtt * 0.7 + rtt * 0.3 : rtt;
			}
			return;
		}
		if (p.t === 'invite') {
			const cb = c.waiters.shift();
			if (cb) {
				cb(typeof p.code === 'string' && /^[A-Z2-9]{10}$/.test(p.code) ? `SB-${gid}-${p.code}` : null);
			}
			return;
		}
		const why = clean(p.why, 120);
		if (p.t === 'gone' || (p.t === 'error' && p.fatal)) {
			c.dead = true;
			if (c.onFail) {
				c.onFail(why);
				c.onFail = undefined;
			}
			if (groups[gid] && why === 'not a member' && !c.retried && prevKey && prevKey.owner === me) {
				// The group may know this account by its other keys: a hand-over it took without our hearing, or one
				// still to come. Those are tried before the group is given up.
				delete conns[gid];
				connectGroup(gid, { old: !c.old, retried: true, waiters: c.waiters });
				return;
			}
			if (groups[gid] && (p.t === 'gone' || /not a member|no such group/.test(why))) {
				/** @type {string | null} */
				let note = `You're no longer in ${groups[gid].name}`;
				if (why === 'left') {
					note = null;
				} else if (why === 'deleted') {
					note = `${groups[gid].name} was deleted by its owner`;
				}
				dropGroup(gid, note);
			}
			return;
		}
		// A relay without hand-overs, or one it refused: the group stays on the previous keys until the next visit.
		if (p.t === 'error' && c.old && /bad key change|unknown/.test(why)) {
			return;
		}
		if (p.t === 'error') {
			const waiter = /invite|full|already a member|member number/.test(why) && c.waiters.shift();
			if (waiter) {
				waiter(null, why);
			}
			// The group still has this number on old keys (browser data cleared): only a code made for it gets back in.
			if (why === 'that member number is taken') {
				return notify(
					`⚠ This group still lists you from before. Ask its admin for a code made for #${Player.MemberNumber}: Invite › Let back in`,
				);
			}
			notify(`⚠ ${why}`);
		}
	}

	/**
	 * A roster member's keys, kept only if well formed.
	 * @param {Partial<GroupMember>} m
	 * @returns {Partial<GroupMember>}
	 */
	function memberKeys(m) {
		const b64 = /^[A-Za-z0-9_-]{16,128}$/;
		if (
			!m.pub ||
			!b64.test(m.pub.x || '') ||
			!b64.test(m.pub.y || '') ||
			typeof m.ek !== 'string' ||
			!EK_RE.test(m.ek) ||
			!b64.test(m.eks || '')
		) {
			return {};
		}
		const rk = m.rk;
		const handover =
			rk && b64.test(rk.x || '') && b64.test(rk.y || '') && b64.test(rk.sig || '') ? { x: rk.x, y: rk.y, sig: rk.sig } : null;
		return { pub: { x: m.pub.x, y: m.pub.y }, ek: m.ek, eks: m.eks, ...(handover ? { rk: handover } : {}) };
	}
	/**
	 * Stores a group's roster from the relay (cleaned); ignored if you are not in it.
	 * @param {string} gid
	 * @param {Partial<RelayRoster> | undefined} r
	 */
	function takeRoster(gid, r) {
		if (!r || typeof r !== 'object' || !Array.isArray(r.members)) {
			return;
		}
		const old = groups[gid];
		const members = r.members
			.slice(0, LIMITS.members)
			.filter((m) => m && isNum(m.n))
			.map((m) => ({
				n: m.n,
				name: clean(m.name, LIMITS.name) || `#${m.n}`,
				kf: typeof m.kf === 'string' ? m.kf.slice(0, 16) : '',
				...memberKeys(m),
			}));
		const rosterOnline = r.online;
		if (!members.some((m) => m.n === Player.MemberNumber)) {
			return;
		}
		if (!old && Object.keys(groups).length >= LIMITS.groups) {
			return;
		}
		groups[gid] = {
			id: gid,
			name: clean(r.name, LIMITS.name) || 'Group chat',
			owner: isNum(r.owner) ? r.owner : 0,
			admins: Array.isArray(r.admins) ? r.admins.filter(isNum).slice(0, LIMITS.admins) : [],
			open: r.open === true,
			members,
			online: Array.isArray(rosterOnline) ? rosterOnline.filter(isNum).slice(0, LIMITS.members) : (old && old.online) || [],
			last: old ? old.last || 0 : 0,
			picv: old ? old.picv : undefined,
			pic: old ? old.pic : undefined,
		};
		saveGC();
		emit('group', groupView(groups[gid]));
		if (isOpen()) {
			render(true);
		}
		// Friends who moved to new keys: followed if their old keys signed the new ones, and their new encryption key kept.
		for (const m of members) {
			if (m.rk && m.pub && m.ek && peerKeys[m.n] && peerKeys[m.n] !== m.kf) {
				trustedEk(gid, m)
					.then((ok) => {
						if (ok && m.ek) {
							peerEks[m.n] = m.ek;
							saveGC();
							if (isOpen()) {
								render(true);
							}
						}
					})
					.catch((e) => warn(e, 'key'));
			}
		}
	}

	/**
	 * Adds group messages to `hist`.
	 * @param {string} gid
	 * @param {RelayGroupMessage[] | undefined} msgs
	 * @param {boolean} isLive they just arrived (a card each); otherwise history from the sign-in (one card for all)
	 */
	function takeMsgs(gid, msgs, isLive) {
		const g = groups[gid];
		if (!g || !Array.isArray(msgs)) {
			return;
		}
		const me = Player.MemberNumber;
		/** @type {HistEntry[]} */
		const fresh = [];
		for (const m of msgs.slice(-200)) {
			if (!m || !Number.isInteger(m.id) || m.id <= 0) {
				continue;
			}
			const k = `g:${gid}:${m.id}`;
			if (histKeys.has(k) || deletedKeys.has(k)) {
				continue;
			}
			const sys = m.sys === true;
			const from = !sys && isNum(m.from) ? m.from : 0;
			const text = clean(m.text, LIMITS.text + 100);
			if (!text) {
				continue;
			}
			/** @type {HistEntry} */
			const h = {
				k,
				group: gid,
				MemberNumber: from,
				MemberName: sys ? '' : clean(m.name, LIMITS.name) || `#${from}`,
				Sent: from === me,
				Time: Number(m.at) || Date.now(),
				text,
				sys: sys ? 'roster' : undefined,
				unread: !sys && from !== me,
			};
			hist.push(h);
			histKeys.add(k);
			fresh.push(h);
			if (m.id > (g.last || 0)) {
				g.last = m.id;
			}
		}
		if (!fresh.length) {
			return;
		}
		hist.sort((a, b) => a.Time - b.Time);
		saveHistory();
		saveGC();
		const unseen = fresh.filter((h) => h.unread && notifies(h));
		if (unseen.length && !(isOpen() && thread === `g:${gid}` && !document.hidden)) {
			ding(unseen);
			if (isLive || unseen.length === 1) {
				for (const h of unseen.slice(-3)) {
					announce(h);
				}
			} else if (!opts.dnd) {
				card({
					icon: groupAv({}),
					pic: g.pic,
					title: `👥 ${g.name}`,
					text: `${unseen.length} new messages while you were away`,
					onClick: () => {
						thread = `g:${gid}`;
						if (!isOpen()) {
							setOpen(true);
						} else {
							render();
						}
					},
				});
			}
		}
		if (isOpen() && tab !== 'wave') {
			render(true);
		}
	}

	/**
	 * Forgets a group (left, removed or deleted): connection, state and messages.
	 * @param {string} gid
	 * @param {string | null} note shown as a card
	 */
	function dropGroup(gid, note) {
		const g = groups[gid];
		keyMoved(gid);
		delete groups[gid];
		delete groupKeys[gid];
		delete keyState[gid];
		waitingKey.delete(gid);
		saveGroupKeys();
		const c = conns[gid];
		if (c) {
			c.dead = true;
			try {
				if (c.ws) {
					c.ws.close();
				}
			} catch (e) {
				/* gone */
			}
			delete conns[gid];
		}
		hist = hist.filter((h) => h.group !== gid);
		histKeys.clear();
		for (const h of hist) {
			histKeys.add(h.k);
		}
		saveGC();
		saveHistory();
		if (note && g) {
			card({ icon: groupAv({}), title: `👥 ${g.name}`, text: note });
		}
		if (g) {
			emit('groupGone', { id: gid });
		}
		if (isOpen()) {
			if (thread === `g:${gid}`) {
				thread = null;
			}
			render(true);
		}
	}

	/**
	 * Sends a message to a group.
	 * @param {string} id
	 * @param {string} text
	 */
	/**
	 * Makes a group on the relay and invites the `picked` friends.
	 * @param {string} name
	 * @param {number[]} picked
	 * @param {boolean} open anyone in it can invite (else admins only)
	 * @param {(id: string) => void} done gets the new group id once it exists
	 */
	function createGroup(name, picked, open, done) {
		if (!secure()) {
			needHttps();
			return;
		}
		const id = newId();
		connectGroup(id, {
			create: { name: clean(name, LIMITS.name) || 'Group chat', open: !!open },
			onWelcome: () => {
				unlock('ps');
				inviteAll(id, picked);
				if (done) {
					done(id);
				}
			},
			onFail: (why) => notify(`⚠ Couldn't make the group${why ? `: ${why}` : ''}`),
		});
	}
	/**
	 * Asks the relay for an invite code.
	 * @param {string} id the group
	 * @param {number | null} member the only member number it works for, or null for anyone
	 * @param {(code: string | null, why?: string) => void} cb
	 */
	function requestInvite(id, member, cb) {
		const c = conns[id] || connectGroup(id);
		c.waiters.push(cb);
		relaySend(id, { t: 'invite', member: member == null ? null : member });
	}
	/**
	 * Invites one member to a group with a code made for them alone. Friends get it delivered
	 * (deliverInvite); for anyone else the code is returned to pass on.
	 * @param {string} id
	 * @param {number} n
	 * @returns {Promise<{ ok: boolean, sent?: string, code?: string, why?: string }>}
	 */
	function inviteToGroup(id, n) {
		const g = groups[id];
		if (!g) {
			return Promise.resolve({ ok: false, why: 'no such group' });
		}
		if (!isNum(n) || !loggedIn() || n === Player.MemberNumber) {
			return Promise.resolve({ ok: false, why: 'bad member number' });
		}
		// An admin's code for someone already listed lets them back in with new keys (they lost theirs).
		const back = isMember(g, n);
		if (back && !isAdmin(g, Player.MemberNumber)) {
			return Promise.resolve({ ok: false, why: 'already a member' });
		}
		if (!canInvite(g, Player.MemberNumber)) {
			return Promise.resolve({ ok: false, why: 'only admins can invite here' });
		}
		if (!back && g.members.length >= LIMITS.members) {
			return Promise.resolve({ ok: false, why: 'group is full' });
		}
		return new Promise((resolve) => {
			const timer = setTimeout(() => resolve({ ok: false, why: 'no answer from the group chat server' }), 10000);
			requestInvite(id, n, (code, why) => {
				clearTimeout(timer);
				if (!code) {
					return resolve({ ok: false, why: why || 'refused' });
				}
				if (isFriend(n)) {
					resolve({ ok: true, sent: deliverInvite(n, code, g.name), code });
				} else {
					resolve({ ok: true, code });
				}
			});
		});
	}

	/**
	 * Invites friends to a group (inviteToGroup each), then says in one note how it went.
	 * @param {string} id
	 * @param {number[]} picked
	 */
	async function inviteAll(id, picked) {
		const results = await Promise.all(picked.map((n) => inviteToGroup(id, n)));
		const sent = picked.filter((n, i) => results[i].ok && results[i].sent && results[i].sent !== 'later');
		const later = picked.filter((n, i) => results[i].sent === 'later');
		const failed = picked.filter((n, i) => !results[i].ok);
		const notes = [];
		if (sent.length) {
			notes.push(`📨 ${sent.length} invite${sent.length === 1 ? '' : 's'} sent`);
		}
		if (later.length) {
			notes.push(`⏳ ${later.map(nameOf).join(', ')}: no SlimeBeep, so try again in a minute`);
		}
		if (failed.length) {
			const why = results[picked.indexOf(failed[0])].why;
			notes.push(`⚠ No invite for ${failed.map(nameOf).join(', ')}${why ? `: ${why}` : ''}`);
		}
		if (notes.length) {
			notify(notes.join(' · '));
		}
	}
	/** Most invite beeps to friends without SlimeBeep per minute. */
	const PLAIN_MAX = 3;
	/** Milliseconds between invite beeps to friends without SlimeBeep. */
	const PLAIN_GAP = 3000;
	/** Milliseconds between invite beeps to friends with SlimeBeep. */
	const PEER_GAP = 1000;
	/** @type {number[]} Times of the invite beeps to friends without SlimeBeep sent in the last minute. */
	const plainSent = [];
	/** When the last scheduled invite beep goes out. */
	let inviteAt = 0;
	/**
	 * Delivers a friend's invite code in a beep, which shows in both chats: friends with SlimeBeep get it
	 * as an invite too (inviteFromBeep), the others get a word on where to find SlimeBeep (at most
	 * PLAIN_MAX a minute). Invite beeps go out PLAIN_GAP / PEER_GAP apart.
	 * @param {number} n
	 * @param {string} code
	 * @param {string} name the group's name
	 * @returns {'invite'|'beep'|'later'} 'invite' to a friend with SlimeBeep; 'later': over the limit, nothing sent
	 */
	function deliverInvite(n, code, name) {
		const peer = peers.has(n);
		const now = Date.now();
		if (!peer) {
			while (plainSent.length && now - plainSent[0] > 60000) {
				plainSent.shift();
			}
			if (plainSent.length >= PLAIN_MAX) {
				return 'later';
			}
			plainSent.push(now);
		}
		inviteAt = Math.max(now, inviteAt + (peer ? PEER_GAP : PLAIN_GAP));
		const text = peer
			? `👥 Join my group chat "${name}": ${code}`
			: `👥 Come join my group chat "${name}" on SlimeBeep (a BC add-on, in FUSAM's Addon Manager). Group code: ${code}`;
		setTimeout(() => beep(n, text, false), inviteAt - now);
		return peer ? 'invite' : 'beep';
	}
	/**
	 * Disables pick-list boxes past PLAIN_MAX ticked friends without SlimeBeep (or all unticked ones when `full`).
	 * @param {HTMLInputElement[]} boxes
	 * @param {boolean} full
	 */
	function capPlain(boxes, full) {
		const plain = boxes.filter((b) => b.checked && !peers.has(Number(b.value))).length;
		for (const b of boxes) {
			if (b.checked) {
				continue;
			}
			const capped = !peers.has(Number(b.value)) && plain >= PLAIN_MAX;
			b.disabled = full || capped;
			b.title = capped ? `${PLAIN_MAX} friends without SlimeBeep at a time (they get a beep each)` : '';
		}
	}
	/**
	 * Opens a group's chat (after joining it).
	 * @param {string} gid
	 */
	const openJoined = (gid) => {
		tab = 'groups';
		thread = `g:${gid}`;
		if (!isOpen()) {
			setOpen(true);
		} else {
			render();
		}
	};
	/** Adds a Join button after group codes in the game's chat log; each message is scanned once (data-sb-seen). */
	function joinButtonsInChat() {
		const chatLog = document.getElementById('TextAreaChatLog');
		if (!chatLog) {
			return;
		}
		for (const el of $$(chatLog, '.ChatMessage:not([data-sb-seen])')) {
			el.dataset.sbSeen = '1';
			const codes = [...new Set(String(el.textContent || '').match(CODE_IN) || [])].slice(0, 3);
			for (const code of codes) {
				const b = document.createElement('button');
				b.className = 'sb-bcjoin';
				b.textContent = groups[codeGroup(code)] ? '👥 Open in SlimeBeep' : '👥 Join';
				b.title = `SlimeBeep group ${code}`;
				b.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					joinCode(code, openJoined);
				});
				el.appendChild(b);
			}
		}
	}
	/**
	 * Joins a group with an invite code (SB-…).
	 * @param {string} raw the code as typed or pasted
	 * @param {(gid: string) => void} [done] runs once in, or at once if already a member
	 */
	function joinCode(raw, done) {
		const m = CODE_RE.exec(String(raw || '').trim());
		if (!m) {
			return notify('That is not a SlimeBeep group code');
		}
		if (!secure()) {
			return needHttps();
		}
		const [, gid, code] = m;
		if (groups[gid]) {
			if (done) {
				done(gid);
			}
			return;
		}
		if (Object.keys(groups).length >= LIMITS.groups) {
			return notify('You are in too many groups');
		}
		notify('👥 Joining…');
		connectGroup(gid, {
			invite: code,
			onWelcome: () => {
				invitations = invitations.filter((i) => !i.code.startsWith(`SB-${gid}-`));
				saveGC();
				notify(`👥 Joined ${groups[gid] ? groups[gid].name : 'the group'}`);
				if (done) {
					done(gid);
				}
			},
			onFail: (why) => notify(`⚠ Couldn't join${why ? `: ${why}` : ''}`),
		});
	}
	/**
	 * Leaves a group on the relay, then forgets it here.
	 * @param {string} id
	 */
	function leaveGroup(id) {
		relaySend(id, { t: 'leave' });
		setTimeout(() => dropGroup(id, null), 600);
	}
	/**
	 * Deletes a group for everyone (the relay accepts it from the owner only).
	 * @param {string} id
	 */
	function deleteGroup(id) {
		relaySend(id, { t: 'disband' });
		setTimeout(() => dropGroup(id, null), 600);
	}
	/**
	 * The 🚪 box: leave the group, or (owner) delete it.
	 * @param {string} id
	 */
	function askGroup(id) {
		const g = groups[id];
		if (!g || $('sb-ask')) {
			return;
		}
		const owner = g.owner === Player.MemberNumber;
		const others = g.members.filter((m) => m.n !== Player.MemberNumber).length;
		let leaveHint = "You're the only one in it, so leaving deletes it.";
		if (others) {
			leaveHint = owner
				? 'If you leave, the group stays and passes to an admin (or whoever has been in it longest).'
				: 'You can come back only with a new invite.';
		}
		const box = document.createElement('div');
		box.id = 'sb-ask';
		const canDelete = owner && others > 0;
		setHtml(
			box,
			html`<div class="sb-crop-card">
			<b>${g.name}</b>
			<span class="sb-hint" style="text-align:center">${leaveHint}</span>
			${canDelete && html`<div class="sb-warn">Delete removes the group and all its messages <u>for everyone</u>. It can't be undone.</div>`}
			<div class="sb-crop-btns" style="flex-wrap:wrap;justify-content:center"><button class="sb-pill" data-act="keep">Cancel</button><button class="sb-go" data-act="leave">🚪 Leave</button>${canDelete && html`<button class="sb-go sb-danger" data-act="delete">🗑 Delete group</button>`}</div>
		</div>`,
		);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			const act = targetOf(e).dataset.act;
			if (act === 'keep' || targetOf(e) === box) {
				return close();
			}
			if (act !== 'leave' && act !== 'delete') {
				return;
			}
			close();
			if (act === 'delete') {
				deleteGroup(id);
				notify(`🗑 ${g.name} was deleted`);
			} else {
				leaveGroup(id);
				notify(`🚪 You left ${g.name}`);
			}
			thread = null;
			render();
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
	}
	/** Sends your current picture to every group. */
	function pushPicture() {
		const pic = myPfp();
		for (const id of Object.keys(groups)) {
			relaySend(id, { t: 'profile', pic: pic ? pic.data : null });
			groups[id].picv = pic ? pic.v : undefined;
		}
		saveGC();
	}
	/** When relayTick last ran. */
	let lastRelayCheck = 0;
	/**
	 * Every 5 s, once the keys are loaded: connects to each group, checks the mailbox, sends waiting mail and
	 * keep-alives (every 4 min).
	 */
	function relayTick() {
		if (!loggedIn() || Date.now() - lastRelayCheck < 5000) {
			return;
		}
		lastRelayCheck = Date.now();
		if (!secure()) {
			return;
		}
		if (!myKey || myKey.owner !== Player.MemberNumber) {
			// Nothing connects before the keys are loaded: loading them reads the account backup, which can bring groups back.
			getKey()
				.then(() => {
					lastRelayCheck = 0;
					relayTick();
				})
				.catch((e) => warn(e, 'key'));
			return;
		}
		askEks();
		if (keyNews && friendsKnown) {
			// New keys: online SlimeBeep friends hear them now (every hidden beep carries them).
			keyNews = false;
			for (const f of friends) {
				if (peers.has(f.MemberNumber)) {
					sendHidden(f.MemberNumber, { sb: 1, pong: 1 });
				}
			}
		}
		for (const id of Object.keys(groups)) {
			if (!conns[id]) {
				connectGroup(id);
			}
		}
		if (Date.now() - mailChecked > 300000) {
			checkMail();
		}
		mailWaiting();
		// '{"t":"ping"}' is answered by the relay's auto-response. In a group sharing a song it also times the way there.
		for (const [id, c] of Object.entries(conns)) {
			const every = sharing === `g:${id}` || following === `g:${id}` ? 15000 : 240000;
			if (c.ready && c.ws && c.ws.readyState === 1 && Date.now() - (c.pinged || 0) > every) {
				c.pinged = Date.now();
				c.ws.send('{"t":"ping"}');
			}
		}
	}
	/**
	 * ✓ if a group member's key matches the one their own SlimeBeep sent you, ⚠ if not, nothing if unknown.
	 * @param {GroupMember} m
	 */
	function keyMark(m) {
		if (m.n === Player.MemberNumber || !peerKeys[m.n] || !m.kf) {
			return '';
		}
		return peerKeys[m.n] === m.kf
			? html` <span title="Checked: the same key their own SlimeBeep sent you">✓</span>`
			: html` <span title="Not the key their own SlimeBeep sent you: this may not really be them">⚠</span>`;
	}

	/** @type {[number, HiddenPayload | (() => HiddenPayload | null)][]} Hidden beeps waiting to go out, sent 250 ms apart by drain. */
	const outbox = [];
	/**
	 * Queues a hidden beep to a friend; every one also carries your picture version (`pv`), key start (`kf`)
	 * and, except picture pieces, your encryption key (`ek`).
	 * @param {number} n
	 * @param {HiddenPayload | (() => HiddenPayload | null)} payload or a function that makes it when it goes out (null: nothing to send)
	 */
	function sendHidden(n, payload) {
		outbox.push([n, payload]);
		if (outbox.length === 1) {
			drain();
		}
	}
	/**
	 * A hidden beep's message, with your picture version and keys.
	 * @param {HiddenPayload} payload
	 */
	function hiddenMessage(payload) {
		const pic = myPfp();
		const k = myKey && myKey.owner === Player.MemberNumber ? myKey : null;
		/** @type {{ kf?: string, ek?: string }} */
		const keys = {};
		if (k) {
			keys.kf = k.kf;
			if (!payload.pf) {
				keys.ek = k.ek;
			}
		}
		const st = myStatus();
		// Picture pieces fill the beep already.
		const status = payload.pf ? {} : { st: st.t || st.l || st.a.length ? st : 0 };
		return JSON.stringify({ ...payload, pv: pic ? pic.v : 0, ...keys, ...status });
	}
	/** Sends the next hidden beep in `outbox`. */
	function drain() {
		if (!outbox.length) {
			return;
		}
		const [n, payload] = outbox[0];
		const p = typeof payload === 'function' ? payload() : payload;
		if (!p) {
			outbox.shift();
			drain();
			return;
		}
		try {
			ServerSend('AccountBeep', { MemberNumber: n, BeepType: PROTO, IsSecret: true, Message: hiddenMessage(p) });
		} catch (e) {
			warn(e);
		}
		setTimeout(() => {
			outbox.shift();
			drain();
		}, 250);
	}

	/** @type {Set<number>} SlimeBeep friends asked for their encryption key this visit. */
	const askedEk = new Set();
	/** Pings online SlimeBeep friends whose encryption key we don't have yet; their pong carries it. */
	function askEks() {
		for (const f of friends) {
			const n = f.MemberNumber;
			if (peers.has(n) && !peerEks[n] && !askedEk.has(n) && askedEk.size < 200) {
				askedEk.add(n);
				sendHidden(n, { sb: 1, ping: 1 });
			}
		}
	}
	/** How often online friends are asked whether they have SlimeBeep, by themselves. */
	const FIND_EVERY = 600000;
	/** The timed search asks a friend who didn't answer again only after this long. */
	const FIND_AGAIN = 3600000;
	/** Member number -> when they were last asked whether they have SlimeBeep. */
	const peerAsked = new Map();
	/**
	 * Asks online friends not yet known to have SlimeBeep whether they do (hidden, answered by their SlimeBeep).
	 * @param {boolean} [timed] the search every FIND_EVERY: skips friends asked within FIND_AGAIN
	 */
	function findPeers(timed = false) {
		const now = Date.now();
		const ask = friends
			.filter((f) => !peers.has(f.MemberNumber) && !(timed && now - (peerAsked.get(f.MemberNumber) || 0) < FIND_AGAIN))
			.slice(0, 40);
		for (const f of ask) {
			peerAsked.set(f.MemberNumber, now);
			sendHidden(f.MemberNumber, { sb: 1, ping: 1 });
		}
		return ask.length;
	}
	/**
	 * A beep from the server. If the game's beep log has not listed it 1.5 s later (another add-on took
	 * it, or its BeepType kept it out), it is added to `hist` here. Leash beeps and add-on data are skipped.
	 * @param {ServerBeep} d
	 */
	function catchBeep(d) {
		if (!d || typeof d.MemberNumber !== 'number' || typeof d.MemberName !== 'string') {
			return;
		}
		const type = typeof d.BeepType === 'string' ? d.BeepType : '';
		if (/leash/i.test(type)) {
			return;
		}
		const msg = typeof d.Message === 'string' ? d.Message : undefined;
		if (isSignal(msg, type)) {
			return;
		}
		if (type && !parseBeep(msg).text) {
			return;
		}
		const at = Date.now();
		setTimeout(() => {
			try {
				const listed = gameLog().some(
					(b) =>
						b &&
						b.MemberNumber === d.MemberNumber &&
						!b.Sent &&
						(b.Message ?? undefined) === msg &&
						Math.abs(new Date(b.Time).getTime() - at) < 15000,
				);
				console.debug(
					`[SlimeBeep] beep from ${d.MemberName} (${d.MemberNumber}), type "${type}": ${listed ? "in the game's beep list" : "not in the game's beep list, kept by SlimeBeep"}`,
				);
				if (listed || !loggedIn()) {
					return;
				}
				if (histOwner !== Player.MemberNumber) {
					loadHistory();
				}
				const k = `raw:${d.MemberNumber}|${at}`;
				if (histKeys.has(k)) {
					return;
				}
				const h = {
					k,
					MemberNumber: d.MemberNumber,
					MemberName: d.MemberName,
					Sent: false,
					Time: at,
					Message: msg,
					ChatRoomName: d.ChatRoomName || undefined,
					unread: true,
				};
				hist.push(h);
				histKeys.add(k);
				saveHistory();
				if (isReaction(h)) {
					return;
				}
				ding([h]);
				inviteFromBeep(h);
				announce(h);
				if (isOpen() && tab !== 'wave') {
					render(true);
				}
			} catch (e) {
				warn(e);
			}
		}, 1500);
	}
	/** Asks the server for the online friends (answered through onServer). */
	const askFriends = () => {
		if (!loggedIn()) {
			return;
		}
		listen();
		try {
			if (typeof ServerSend === 'function') {
				ServerSend('AccountQuery', { Query: 'OnlineFriends' });
			}
		} catch (e) {
			warn(e, 'friends');
		}
	};

	/** Whether the panel is open. */
	const isOpen = () => $('sb-panel').style.display === 'flex';
	/**
	 * Opens or closes the panel.
	 * @param {boolean} on
	 */
	function setOpen(on) {
		panelActive = on;
		if (!on) {
			for (const id of ['sb-crop', 'sb-zoom', 'sb-ask', 'sb-emoji']) {
				if ($(id)) {
					$(id).remove();
				}
			}
		}
		$('sb-panel').style.display = on ? 'flex' : 'none';
		if (on) {
			askFriends();
			render();
		}
		place();
	}

	/** Positions the toggle (opts.pos, kept on screen) and the window (opts.win, or next to the toggle). */
	function place() {
		const t = $('sb-toggle'),
			panel = $('sb-panel');
		const size = t.offsetWidth || 46;
		const x = opts.pos ? opts.pos.x * innerWidth : innerWidth - size - 14;
		const y = opts.pos ? opts.pos.y * innerHeight : innerHeight - size - 14;
		const left = Math.max(0, Math.min(innerWidth - size, x));
		const top = Math.max(0, Math.min(innerHeight - size, y));
		t.style.left = `${left}px`;
		t.style.top = `${top}px`;
		placeCards();
		if (!isOpen()) {
			return;
		}
		const r = windowRect(left, top, size);
		panel.style.left = `${r.x}px`;
		panel.style.top = `${r.y}px`;
		panel.style.width = `${r.w}px`;
		panel.style.height = `${r.h}px`;
		placeCards();
	}

	/** The window's usual size, and the smallest it can be made (narrower squeezes the tabs). */
	const WIN = { w: 340, h: 480, minW: 340, minH: 320 };
	/**
	 * `v` kept between `lo` and `hi` (`lo` wins when they cross, as in a window smaller than the minimum).
	 * @param {number} v
	 * @param {number} lo
	 * @param {number} hi
	 */
	const fit = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
	/**
	 * Where the window goes: opts.win (kept inside the browser window), else by the toggle at the usual
	 * size, above it if it fits, else below, else as low as fits.
	 * @param {number} left the toggle's place
	 * @param {number} top
	 * @param {number} size the toggle's size
	 * @returns {{ x: number, y: number, w: number, h: number }}
	 */
	function windowRect(left, top, size) {
		const win = opts.win;
		if (win && [win.x, win.y, win.w, win.h].every(Number.isFinite)) {
			const w = Math.round(fit(win.w, Math.min(WIN.minW, innerWidth - 16), innerWidth - 16));
			const h = Math.round(fit(win.h, Math.min(WIN.minH, innerHeight - 16), innerHeight - 16));
			return { x: Math.round(fit(win.x, 8, innerWidth - w - 8)), y: Math.round(fit(win.y, 8, innerHeight - h - 8)), w, h };
		}
		const w = Math.min(WIN.w, innerWidth - 16);
		const h = Math.min(WIN.h, innerHeight - 16);
		const above = top - h - 10;
		const below = top + size + 10;
		let y = Math.max(8, innerHeight - h - 8);
		if (above >= 8) {
			y = above;
		} else if (below + h <= innerHeight - 8) {
			y = below;
		}
		return { x: Math.max(8, Math.min(innerWidth - w - 8, left + size - w)), y, w, h };
	}
	/**
	 * Makes the window move by its header and resize by its edges and corners, like a desktop window;
	 * the result is saved in opts.win. Double-clicking an edge gives back the usual size.
	 * @param {HTMLElement} panel
	 */
	function wireWindow(panel) {
		/** @type {{ mode: string, x0: number, y0: number, lastX: number, lastY: number, r: DOMRect } | null} The move or resize in progress ('move', or the edges: 'n', 'se'...). */
		let op = null;
		const head = /** @type {HTMLElement} */ (panel.querySelector('.sb-head'));
		/**
		 * @param {PointerEvent} e
		 * @param {string} mode
		 * @param {HTMLElement} el gets the pointer capture
		 */
		const begin = (e, mode, el) => {
			e.preventDefault();
			op = { mode, x0: e.clientX, y0: e.clientY, lastX: e.clientX, lastY: e.clientY, r: panel.getBoundingClientRect() };
			try {
				el.setPointerCapture(e.pointerId);
			} catch (err) {
				/* works without capture */
			}
		};
		/** @param {PointerEvent} e */
		const move = (e) => {
			if (!op) {
				return;
			}
			if (!(e.buttons & 1)) {
				end();
				return;
			}
			// As with the slime: the pointer is kept inside the window, and a jump of half of it is no real move.
			const x = fit(e.clientX, 0, innerWidth);
			const y = fit(e.clientY, 0, innerHeight);
			if (Math.abs(x - op.lastX) > innerWidth / 2 || Math.abs(y - op.lastY) > innerHeight / 2) {
				return;
			}
			op.lastX = x;
			op.lastY = y;
			const dx = x - op.x0;
			const dy = y - op.y0;
			const r = op.r;
			let left = r.left;
			let top = r.top;
			let right = r.right;
			let bottom = r.bottom;
			if (op.mode === 'move') {
				left = fit(r.left + dx, 8, innerWidth - r.width - 8);
				top = fit(r.top + dy, 8, innerHeight - r.height - 8);
				right = left + r.width;
				bottom = top + r.height;
			} else {
				if (op.mode.includes('w')) {
					left = fit(r.left + dx, 8, right - WIN.minW);
				}
				if (op.mode.includes('e')) {
					right = fit(r.right + dx, left + WIN.minW, innerWidth - 8);
				}
				if (op.mode.includes('n')) {
					top = fit(r.top + dy, 8, bottom - WIN.minH);
				}
				if (op.mode.includes('s')) {
					bottom = fit(r.bottom + dy, top + WIN.minH, innerHeight - 8);
				}
			}
			opts.win = { x: Math.round(left), y: Math.round(top), w: Math.round(right - left), h: Math.round(bottom - top) };
			panel.style.left = `${opts.win.x}px`;
			panel.style.top = `${opts.win.y}px`;
			panel.style.width = `${opts.win.w}px`;
			panel.style.height = `${opts.win.h}px`;
			placeCards();
		};
		/** Ends a move or resize and saves where the window is. */
		const end = () => {
			if (!op) {
				return;
			}
			op = null;
			saveOpts();
			place();
		};
		head.addEventListener('pointerdown', (e) => {
			// Your picture is clicked, not dragged (a drag would take its click).
			if (e.button === 0 && !targetOf(e).closest('button, #sb-me')) {
				begin(e, 'move', head);
			}
		});
		const handles = $$(panel, '.sb-rs');
		for (const el of [head, ...handles]) {
			el.addEventListener('pointermove', move);
			el.addEventListener('pointerup', end);
			el.addEventListener('pointercancel', end);
			el.addEventListener('lostpointercapture', end);
		}
		for (const g of handles) {
			g.addEventListener('pointerdown', (e) => {
				if (e.button === 0) {
					begin(e, g.dataset.rs || 'se', g);
				}
			});
			g.addEventListener('dblclick', () => {
				const r = panel.getBoundingClientRect();
				setOpt('win', { x: Math.round(r.left), y: Math.round(r.top), w: WIN.w, h: WIN.h });
				place();
			});
		}
	}

	/** Ticks since start (theme matching runs every 5th). */
	let tickCount = 0;
	/** Whether a tick error was already logged (only the first one is). */
	let tickWarned = false;
	/** When the friend list was last asked for while beeps wait. */
	let friendsAskedAt = 0;
	/** When online friends were last searched for SlimeBeep by themselves. */
	let foundAt = 0;
	/** Runs every second: listeners, relay, update note, new beeps (badge, sound, cards, redraw). */
	function tick() {
		try {
			updateNote();
			gameCheck();
			if (music || following) {
				keepInTime();
				shareBeat();
				drawMusic();
			}
			if (loggedIn() && histOwner === Player.MemberNumber) {
				achTick();
				statusTick();
				helloTick();
			}
			if (loggedIn() && histOwner === Player.MemberNumber && Date.now() - foundAt > FIND_EVERY) {
				foundAt = Date.now();
				askFriends();
				setTimeout(() => findPeers(true), 3000);
			}
			if (waiting.length && loggedIn() && Date.now() - (friendsAskedAt || 0) > 60000) {
				friendsAskedAt = Date.now();
				askFriends();
			}
			if (!tickCount || ++tickCount % 5 === 0) {
				applyThemed();
			}
			if (loggedIn()) {
				joinButtonsInChat();
			}
			tickCount = tickCount || 1;
			if (loggedIn()) {
				listen();
			}
			if (loggedIn() && histOwner === Player.MemberNumber) {
				relayTick();
			}
			const first = histOwner === null || (loggedIn() && histOwner !== Player.MemberNumber);
			const fresh = sync();
			const n = log().filter((h) => unread(h) && notifies(h)).length;
			const badge = $('sb-badge');
			badge.textContent = n > 99 ? '99+' : String(n);
			badge.style.display = n ? 'block' : 'none';
			// Beeps already in the log at login get no card or sound.
			if (first || !fresh.length) {
				if (fresh.length && isOpen()) {
					render(true);
				}
				return;
			}
			ding(fresh);
			fresh.forEach(inviteFromBeep);
			for (const h of fresh.slice(-4)) {
				announce(h);
			}
			if (isOpen() && tab !== 'wave') {
				render(true);
			}
		} catch (e) {
			if (!tickWarned) {
				tickWarned = true;
				warn(e);
			}
		}
	}

	/**
	 * A friend's beep with a group code in it (how SlimeBeep sends invites) is kept with the invitations,
	 * as an invite card would be. Codes from strangers only get the Join button in the chat.
	 * @param {HistEntry} h
	 */
	function inviteFromBeep(h) {
		if (h.group || h.Sent || typeof h.Message !== 'string' || !isFriend(h.MemberNumber)) {
			return;
		}
		const text = parseBeep(h.Message).text;
		const code = (text.match(CODE_IN) || [])[0];
		if (code) {
			takeInvite(h.MemberNumber, h.MemberName, { code, name: (/group chat "(.*)"/.exec(text) || [])[1] }, true);
		}
	}
	/**
	 * Turns Do not disturb on or off and shows it on the 🔔/🔕 header button.
	 * @param {boolean} on
	 */
	function setDnd(on) {
		setOpt('dnd', on);
		const b = $('sb-dnd');
		if (b) {
			b.textContent = on ? '🔕' : '🔔';
			b.title = on ? 'Do not disturb is on: no sounds or pop-ups (click to turn off)' : 'Do not disturb';
			b.classList.toggle('on', on);
		}
	}
	/** How long before the same person gets the AFK auto-reply again. */
	const AFK_GAP = 10 * 60 * 1000;
	/** What every AFK auto-reply starts with, so two players away don't reply to each other. */
	const AFK_MARK = '💤 Auto-reply: ';
	/** @type {Map<number, number>} Member -> when they last got the auto-reply. */
	const afkTold = new Map();
	/**
	 * Turns AFK on or off and shows it on the 💤 header button.
	 * @param {boolean} on
	 */
	function setAfk(on) {
		setOpt('afk', on);
		afkTold.clear();
		const b = $('sb-afk');
		if (b) {
			b.textContent = '💤';
			b.title = on ? `AFK: beeps and whispers get "${opts.afkMsg}" (click when you're back)` : 'Go AFK (auto-reply)';
			b.classList.toggle('on', on);
		}
	}
	/** The box for going AFK: the auto-reply to send. */
	function openAfk() {
		if ($('sb-ask')) {
			return;
		}
		const box = document.createElement('div');
		box.id = 'sb-ask';
		setHtml(
			box,
			html`<div class="sb-crop-card sb-status-card">
			<b>💤 Go AFK</b>
			<input class="sb-search" id="sb-afk-text" maxlength="200" placeholder="Your auto-reply" aria-label="Your auto-reply">
			<span class="sb-hint" style="text-align:center">Anyone who beeps or whispers you gets this reply, once every 10 minutes each, until you click 💤 again.</span>
			<div class="sb-crop-btns" style="justify-content:center"><button class="sb-pill" data-act="cancel">Cancel</button><button class="sb-go" data-act="go">Go AFK</button></div>
		</div>`,
		);
		const text = /** @type {HTMLInputElement} */ (box.querySelector('#sb-afk-text'));
		text.value = opts.afkMsg;
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		const go = () => {
			setOpt('afkMsg', clean(text.value, 200) || "I'm away right now, I'll answer when I'm back!");
			setAfk(true);
			close();
			notify(`💤 AFK: "${opts.afkMsg}"`);
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			} else if (e.key === 'Enter' && e.target === text) {
				e.preventDefault();
				go();
			}
		};
		box.addEventListener('click', (e) => {
			const act = targetOf(e).dataset.act;
			if (targetOf(e) === box || act === 'cancel') {
				close();
			} else if (act === 'go') {
				go();
			}
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
		text.focus();
	}
	/**
	 * While AFK, answers a beep or whisper with the auto-reply: once per person every AFK_GAP, never to
	 * another auto-reply, a reaction or a group chat.
	 * @param {number} n who wrote
	 * @param {string} text what they wrote
	 * @param {boolean} whisper it came as a room whisper (the reply goes the same way)
	 */
	function afkReply(n, text, whisper) {
		if (!opts.afk || !loggedIn() || !isNum(n) || n === Player.MemberNumber || String(text).startsWith(AFK_MARK)) {
			return;
		}
		if (Date.now() - (afkTold.get(n) || 0) < AFK_GAP) {
			return;
		}
		afkTold.set(n, Date.now());
		const reply = AFK_MARK + opts.afkMsg;
		if (whisper) {
			if (typeof ChatRoomSendWhisper === 'function') {
				ChatRoomSendWhisper(n, reply);
			}
		} else {
			beep(n, reply, false);
		}
	}
	/**
	 * Shows a new message: a card (unless that chat is open) and, with opts.desktop, a system notification.
	 * Nothing with Do not disturb on.
	 * @param {HistEntry} h
	 */
	function announce(h) {
		if (opts.dnd || !notifies(h) || looking() || (!h.group && isOpen() && thread === h.MemberNumber && !document.hidden)) {
			return;
		}
		const said = replyBody(textOf(h));
		const text = asAction(said, h.MemberName) ?? said;
		const room = h.ChatRoomName && typeof h.Message === 'string' ? `📍 in ${h.ChatRoomName}` : '';
		const g = h.group && groups[h.group];
		if (h.group && isOpen() && thread === `g:${h.group}` && !document.hidden) {
			return;
		}
		const open = () => {
			thread = g ? `g:${g.id}` : h.MemberNumber;
			threadPin = undefined;
			if (!isOpen()) {
				setOpen(true);
			} else {
				render();
			}
		};
		if (opts.popups) {
			card(
				g
					? { icon: groupAv(g), pic: g.pic, title: `👥 ${g.name}`, text: h.announceText || `${h.MemberName}: ${text}`, onClick: open }
					: {
							icon: avatar(h.MemberNumber, h.MemberName),
							pic: (pfpOf(h.MemberNumber) || {}).data,
							title: `💌 ${h.MemberName}`,
							text,
							sub: room,
							onClick: open,
						},
			);
		}
		if (opts.desktop && document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
			try {
				const note = new Notification(`💌 ${h.MemberName}`, {
					body: room ? `${text}\n${room}` : text,
					icon: ICON,
					tag: `slimebeep-${h.MemberNumber}`,
				});
				note.onclick = () => {
					focus();
					open();
					note.close();
				};
			} catch (e) {
				/* the browser said no */
			}
		}
	}

	/**
	 * A card by the toggle.
	 * @typedef {object} CardOptions
	 * @property {SafeHtml} icon
	 * @property {string | null} [pic] the picture a game toast shows (the slime when none)
	 * @property {string} title
	 * @property {string} text
	 * @property {string} [sub] a small line under the text
	 * @property {() => void} [onClick]
	 * @property {number} [ms] how long it stays; 0 until closed
	 * @property {string} [cls] an extra class ('news')
	 */
	/**
	 * Adds a card to the stack (at most 4).
	 * @param {CardOptions} options
	 */
	function card({ icon, pic, title, text, sub = '', onClick, ms = 7000, cls = '' }) {
		if (gameToasts()) {
			gameToast({
				title,
				text: sub ? `${text}\n${sub}` : text,
				pic,
				ms,
				onClick,
				category: cls === 'news' ? 'SlimeBeep-news' : 'SlimeBeep',
			});
			return;
		}
		const box = $('sb-cards');
		const c = document.createElement('div');
		c.className = `sb-card ${cls}`;
		setHtml(
			c,
			html`${icon}<span class="sb-main"><b>${title}</b><span class="sb-txt">${text}</span>${sub && html`<small>${sub}</small>`}</span><button class="sb-x" title="Dismiss">${ICONS.close}</button>`,
		);
		const close = () => {
			c.classList.add('out');
			setTimeout(() => {
				c.remove();
				placeCards();
			}, 250);
		};
		/** @type {HTMLElement} */ (c.querySelector('.sb-x')).addEventListener('click', (e) => {
			e.stopPropagation();
			close();
		});
		c.addEventListener('click', () => {
			close();
			if (onClick) {
				onClick();
			}
		});
		box.prepend(c);
		while (box.lastElementChild && box.children.length > 4) {
			box.lastElementChild.remove();
		}
		placeCards();
		if (ms) {
			setTimeout(close, ms);
		}
	}

	/** Whether the game has its toast system (R133), which SlimeBeep's cards and notes go through. */
	const gameToasts = () => typeof ToastManager === 'object' && ToastManager !== null && typeof ToastManager.custom === 'function';
	/**
	 * Shows a toast through the game's toast system, in SlimeBeep's colours (type sb-toast; the category
	 * picks the variant: SlimeBeep, SlimeBeep-news, SlimeBeep-note or SlimeBeep-crown).
	 * @param {{ title?: string, text: string, pic?: string | null, ms?: number, onClick?: () => void, category?: string }} t
	 */
	function gameToast({ title = '', text, pic, ms = 7000, onClick, category = 'SlimeBeep' }) {
		try {
			ToastManager.custom(text, 'sb-toast', {
				title,
				icon: pic || ICON,
				iconColor: 'default',
				duration: ms,
				category,
				...(onClick ? { onClick } : {}),
			});
		} catch (e) {
			warn(e, 'toast');
		}
	}

	/** Positions the card stack next to the toggle, or the panel when open. */
	function placeCards() {
		const box = $('sb-cards');
		if (!box || !box.children.length) {
			return;
		}
		const open = isOpen();
		const r = (open ? $('sb-panel') : $('sb-toggle')).getBoundingClientRect();
		const w = box.offsetWidth,
			h = box.offsetHeight;
		let left = open ? r.left - w - 10 : r.right - w;
		if (open && left < 8) {
			left = r.right + 10;
		}
		box.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, left))}px`;
		let top = r.bottom + 10;
		if (open) {
			top = r.bottom - h;
		} else if (r.top - h - 10 >= 8) {
			top = r.top - h - 10;
		}
		box.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, top))}px`;
	}

	/**
	 * An item of news.json.
	 * @typedef {object} NewsItem
	 * @property {string} id a version, for its update note, or any id
	 * @property {string} [title]
	 * @property {string} text
	 * @property {string} [date]
	 */
	/** @type {NewsItem[]} The items of news.json. */
	let newsItems = [];

	/** When the chat log appeared (0: not in a room). */
	let noteRoomSince = 0;
	/** Update notes posted so far without showing up in the log. */
	let noteTries = 0;
	/** True while a posted note is being checked. */
	let notePending = false;
	/** When the last note was posted. */
	let noteLastTry = 0;
	/**
	 * After an update or first install, posts a local note (only you see it) in the room chat with the
	 * version and its news.json item. Waits until the chat log has been up 3 s and the news has loaded,
	 * and retries up to 5 times until the note is really in the log.
	 */
	function updateNote() {
		if (opts.lastVersion === VERSION || !loggedIn() || typeof ChatRoomSendLocal !== 'function' || notePending) {
			return;
		}
		const chatLog = document.getElementById('TextAreaChatLog');
		const inRoom = !!chatLog && (typeof ServerPlayerIsInChatRoom === 'function' ? ServerPlayerIsInChatRoom() : !!myRoom());
		if (!inRoom) {
			noteRoomSince = 0;
			return;
		}
		if (!noteRoomSince) {
			noteRoomSince = Date.now();
		}
		if (Date.now() - noteRoomSince < 3000 || (!newsLoaded && Date.now() - started < 15000)) {
			return;
		}
		if (Date.now() - (noteLastTry || 0) < 10000) {
			return;
		}
		if (!opts.updateNotes) {
			opts.lastVersion = VERSION;
			saveOpts();
			return;
		}
		const item = newsItems.find((i) => i.id === VERSION);
		const first = !opts.lastVersion;
		// A version with no news item is a quiet fix: no note.
		if (!first && !item) {
			opts.lastVersion = VERSION;
			saveOpts();
			return;
		}
		const head = first ? `SlimeBeep v${VERSION} is ready!` : `SlimeBeep updated to v${VERSION}`;
		let body = first ? 'Click the pink slime to beep your friends.' : '';
		if (item) {
			body = item.text;
		}
		notePending = true;
		noteLastTry = Date.now();
		const iconStyle = `width:1.3em;height:1.3em;vertical-align:middle;border-radius:50%;margin-right:4px${opts.night ? ';filter:hue-rotate(-105deg)' : ''}`;
		ChatRoomSendLocal(
			String(
				html`<div class="sb-update-note" data-v="${VERSION}" style="margin:2px 0;padding:4px 10px;border-radius:10px;background:#ffe6f3;color:#a3155c;border-left:4px solid #ff4fa3;font-size:.9em"><img src="${ICON}" style="${iconStyle}" alt=""><b>${head}</b>${body && ` ${body}`}</div>`,
			),
		);
		setTimeout(() => {
			notePending = false;
			const shown = !!document.querySelector(`#TextAreaChatLog .sb-update-note[data-v="${CSS.escape(VERSION)}"]`);
			noteTries = (noteTries || 0) + 1;
			if (shown || noteTries >= 5) {
				opts.lastVersion = VERSION;
				saveOpts();
			}
		}, 1500);
	}
	/** Whether gameCheck has run. */
	let gameChecked = false;
	/** Once per load: a card listing what won't work if game globals in NEEDS are missing (once per version and set). */
	function gameCheck() {
		if (gameChecked || !loggedIn()) {
			return;
		}
		gameChecked = true;
		const gone = missing();
		if (!gone.length) {
			return;
		}
		const sig = `${VERSION}:${gone.map(([k]) => k).join(',')}`;
		if (opts.gameWarned === sig) {
			return;
		}
		setOpt('gameWarned', sig);
		const what = [...new Set(gone.map(([, , w]) => w))].join(', ');
		card({
			icon: logoIcon(),
			title: '🫧 SlimeBeep',
			text: `A game update changed something SlimeBeep uses, so this may not work until SlimeBeep updates: ${what}. Everything else works as usual.`,
			ms: 0,
			cls: 'news',
		});
	}
	/** Whether news() has finished (loaded or failed). */
	let newsLoaded = false;
	/** Load time, for updateNote's wait. */
	const started = Date.now();

	/**
	 * Loads news.json and shows the newest unseen item as a card, unless it is this version's (the update note in the
	 * room chat says that one) or update notes are off. Older unseen items are skipped: one note per update is enough.
	 */
	function news() {
		fetch(`${NEWS}?t=${Date.now()}`, { cache: 'no-store' })
			.then((r) => (r.ok ? r.json() : []))
			.then((items) => {
				const valid = Array.isArray(items) ? items.filter((i) => i && i.id && i.text) : [];
				newsItems = valid;
				if (!valid.length) {
					return;
				}
				const seen = Array.isArray(opts.seenNews) ? opts.seenNews : valid.slice(0, -1).map((i) => i.id);
				const newest = valid[valid.length - 1];
				if (opts.updateNotes && !opts.dnd && !seen.includes(newest.id) && newest.id !== VERSION) {
					card({
						icon: logoIcon(),
						title: newest.title || '📢 SlimeBeep news',
						text: newest.text,
						sub: newest.date || '',
						ms: 0,
						cls: 'news',
					});
				}
				opts.seenNews = valid.map((i) => i.id);
				saveOpts();
			})
			.catch(() => {
				/* no news */
			})
			.finally(() => {
				newsLoaded = true;
			});
	}

	/**
	 * The opts.muted key of a message's chat.
	 * @param {HistEntry} h
	 */
	const muteKey = (h) => (h.group ? `g:${h.group}` : `n:${h.MemberNumber}`);
	/**
	 * Whether a chat was made quiet before per-chat levels (opts.muted): chatLevel reads it as 'none'.
	 * @param {string} key
	 */
	const isMuted = (key) => Array.isArray(opts.muted) && opts.muted.includes(key);
	/**
	 * Whether a message says your name or member number as a word.
	 * @param {HistEntry} h
	 */
	const mentionsMe = (h) => {
		const text = textOf(h).toLowerCase();
		const letter = (/** @type {string | undefined} */ c) => !!c && /[\p{L}\p{N}]/u.test(c);
		return [Player.Nickname, Player.Name, String(Player.MemberNumber)].some((n) => {
			const name = typeof n === 'string' ? n.trim().toLowerCase() : '';
			if (name.length < 2) {
				return false;
			}
			for (let i = text.indexOf(name); i >= 0; i = text.indexOf(name, i + 1)) {
				if (!letter(text[i - 1]) && !letter(text[i + name.length])) {
					return true;
				}
			}
			return false;
		});
	};
	/**
	 * Whether a message notifies you (sound, card, badge): not from a muted chat, and from a group only
	 * with opts.groupAll or when it says your name.
	 * @param {HistEntry} h
	 */
	const notifies = (h) => {
		const level = chatLevel(muteKey(h));
		return level === 'all' || (level === 'mention' && mentionsMe(h));
	};
	/** Whether SlimeBeep is open in front of you, so opts.quietOpen keeps new messages quiet. */
	const looking = () => opts.quietOpen && isOpen() && !document.hidden;
	/**
	 * What notifies you from a chat: 'all' messages, only 'mention's of you (and replies to you), or 'none'.
	 * Unset, direct chats are 'all' and groups follow opts.groupAll.
	 * @param {string} key a muteKey
	 * @returns {'all' | 'mention' | 'none'}
	 */
	const chatLevel = (key) => {
		const set = opts.notify && opts.notify[key];
		if (set === 'all' || set === 'mention' || set === 'none') {
			return set;
		}
		if (isMuted(key)) {
			return 'none';
		}
		return key.startsWith('g:') && !opts.groupAll ? 'mention' : 'all';
	};
	/**
	 * Chimes for new messages that notify, unless Do not disturb is on.
	 * @param {HistEntry[]} list
	 */
	const ding = (list) => {
		for (const h of list) {
			if (!h.Sent && !h.group && !isReaction(h) && typeof h.Message === 'string') {
				afkReply(h.MemberNumber, h.Message, false);
			}
		}
		if (opts.sound && !opts.dnd && !looking() && list.some(notifies)) {
			chime();
		}
	};
	/** The header icon and words of each notification level. */
	const LEVELS = {
		all: ['🔔', 'All messages'],
		mention: ['@', 'Only @mentions and replies to me'],
		none: ['🔕', 'Nothing'],
	};
	/**
	 * The notification box of a chat (like Discord's): all messages, only @mentions, or nothing.
	 * @param {string} key a muteKey
	 * @param {string} name the person or group
	 */
	function openNotify(key, name) {
		const now = chatLevel(key);
		askBox(
			html`<div class="sb-crop-card sb-menu-card">
			<b>🔔 Notify me from ${name}</b>
			${Object.entries(LEVELS).map(([level, [icon, words]]) => html`<button class="sb-pill${level === now && ' on'}" data-act="${level}">${icon} ${words}</button>`)}
			<span class="sb-hint" style="text-align:center">Sound, pop-up and the badge on the slime. Unread messages still wait in the chat.</span>
			<button class="sb-pill" data-act="cancel">Cancel</button>
		</div>`,
			(act, close) => {
				close();
				if (act !== 'all' && act !== 'mention' && act !== 'none') {
					return;
				}
				setOpt('notify', { ...opts.notify, [key]: act });
				setOpt(
					'muted',
					(Array.isArray(opts.muted) ? opts.muted : []).filter((k) => k !== key),
				);
				notify(`${LEVELS[act][0]} ${name}: ${LEVELS[act][1].toLowerCase()}`);
				render(true);
			},
		);
	}
	/**
	 * The 🔔 / @ / 🔕 button for a chat header: what notifies you from it.
	 * @param {string} key
	 */
	const muteButton = (key) => {
		const [icon, words] = LEVELS[chatLevel(key)];
		return html`<button id="sb-mute" title="Notifications: ${words}">${icon}</button>`;
	};
	/**
	 * Whether a chat is pinned to the top of its list.
	 * @param {string} key a muteKey
	 */
	const isPinned = (key) => Array.isArray(opts.pinned) && opts.pinned.includes(key);
	/**
	 * Pins a chat to the top of its list, or unpins it.
	 * @param {string} key a muteKey
	 * @param {string} name for the toast
	 */
	function togglePin(key, name) {
		const on = !isPinned(key);
		setOpt('pinned', [...(Array.isArray(opts.pinned) ? opts.pinned : []).filter((k) => k !== key), ...(on ? [key] : [])].slice(-100));
		notify(on ? `📌 ${name} stays at the top` : `${name} is no longer pinned`);
	}
	/**
	 * Order of the chat lists: pinned chats first, then the rest, each newest message first.
	 * @param {{ pinned: boolean, time: number }} a
	 * @param {{ pinned: boolean, time: number }} b
	 */
	const pinnedFirst = (a, b) => Number(b.pinned) - Number(a.pinned) || b.time - a.time;
	/**
	 * Shows a box over the window. Esc, a Cancel button (data-act="cancel") or a click beside the card
	 * closes it; any other data-act button goes to `onAct`.
	 * @param {SafeHtml} content the card
	 * @param {(act: string, close: () => void) => void} onAct
	 */
	function askBox(content, onAct) {
		if ($('sb-ask')) {
			return;
		}
		const box = document.createElement('div');
		box.id = 'sb-ask';
		setHtml(box, content);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			const act = targetOf(e).dataset.act;
			if (targetOf(e) === box || act === 'cancel') {
				close();
			} else if (act) {
				onAct(act, close);
			}
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
	}
	/**
	 * The ⋯ button of a chat header (pin, clear).
	 * @param {string} chat a muteKey
	 */
	const moreButton = (chat) =>
		html`<button id="sb-more" title="${isPinned(chat) ? 'Pinned. More: unpin, clear this chat' : 'More: pin, clear this chat'}">⋯</button>`;
	/**
	 * The ⋯ box of an open chat: pin it to the top of its list (or unpin it), or clear it.
	 * @param {string} chat a muteKey
	 */
	function openChatMenu(chat) {
		const g = chat.startsWith('g:') ? groups[chat.slice(2)] : undefined;
		const name = g ? g.name : nameOf(Number(chat.slice(2)));
		const list = g ? '👥 Groups' : '💬 Chats';
		askBox(
			html`<div class="sb-crop-card sb-menu-card">
			<b>${name}</b>
			<button class="sb-pill" data-act="pin">${isPinned(chat) ? `📌 Unpin from ${list}` : `📌 Pin to the top of ${list}`}</button>
			<button class="sb-pill" data-act="clear">🗑 Clear this chat</button>
			<button class="sb-pill" data-act="cancel">Cancel</button>
		</div>`,
			(act, close) => {
				close();
				if (act === 'pin') {
					togglePin(chat, name);
					render(true);
				} else if (act === 'clear') {
					askClear(chat, name);
				}
			},
		);
	}
	/**
	 * Asks before clearing a chat, then deletes all its messages for you (see deleteMessages).
	 * @param {string} chat a muteKey
	 * @param {string} name the person or group
	 */
	function askClear(chat, name) {
		const isGroup = chat.startsWith('g:');
		const keeps = isGroup ? 'everyone else in the group keeps them' : `${name} keeps them`;
		askBox(
			html`<div class="sb-crop-card">
			<b>🗑 Clear ${isGroup ? name : `your chat with ${name}`}?</b>
			<span class="sb-hint" style="text-align:center">All its messages go from your SlimeBeep only: ${keeps}. It can't be undone.</span>
			<div class="sb-crop-btns"><button class="sb-pill" data-act="cancel">Cancel</button><button class="sb-go sb-danger" data-act="go">🗑 Clear chat</button></div>
		</div>`,
			(act, close) => {
				if (act !== 'go') {
					return;
				}
				close();
				deleteMessages((h) => muteKey(h) === chat);
				notify(`🗑 Cleared ${name}`);
				render();
			},
		);
	}
	/**
	 * The ↩ and 🗑 of a message bubble, shown on hover (or after a tap on touch screens).
	 * @param {HistEntry} h
	 */
	const msgButtons = (h) =>
		html`<span class="sb-acts"><button class="sb-rep" data-rep="${h.k}" title="Reply">↩</button><button class="sb-del" data-del="${h.k}" title="Delete this message (for you only)">🗑</button></span>`;
	/** @type {{ chat: string, name: string, text: string } | null} The message the next one in `chat` answers. */
	let replyTo = null;
	/**
	 * A reply's parts: who and what it answers (its first line, "> Name: text"), and its own text.
	 * @param {string} text
	 * @returns {{ to: string, quote: string, body: string } | null}
	 */
	const splitReply = (text) => {
		const m = /^> ([^\n:]{1,40}): ([^\n]*)\n([\s\S]+)$/.exec(text);
		return m ? { to: m[1], quote: m[2], body: m[3] } : null;
	};
	/**
	 * A message's own text, without the line of the message it answers.
	 * @param {string} text
	 */
	const replyBody = (text) => (splitReply(text) || { body: text }).body;
	/**
	 * The quoted line above a reply's bubble text.
	 * @param {{ to: string, quote: string } | null} r
	 */
	const replyQuote = (r) => r && html`<span class="sb-quote">↩ <b>${r.to}</b> ${r.quote}</span>`;
	/**
	 * Starts a reply to a message in the open chat: the bar above the box shows it until sent or ✕.
	 * @param {string} k its key
	 */
	function startReply(k) {
		const h = hist.find((x) => x.k === k);
		if (!h) {
			return;
		}
		const g = h.group ? groups[h.group] : undefined;
		const name = h.Sent ? myName() : (g && memberName(g, h.MemberNumber)) || h.MemberName || nameOf(h.MemberNumber);
		const line = replyBody(textOf(h)).split('\n')[0];
		replyTo = { chat: muteKey(h), name: clean(name, 40).replace(/:/g, ' '), text: line.length > 60 ? `${line.slice(0, 59)}…` : line };
		render(true);
		const ta = $input('sb-text');
		if (ta) {
			ta.focus();
		}
	}
	/**
	 * The "Replying to" bar above the box of `chat`, when a reply is started there.
	 * @param {string} chat
	 */
	const replyBar = (chat) =>
		replyTo &&
		replyTo.chat === chat &&
		html`<div class="sb-replybar">↩ Replying to <b>${replyTo.name}</b><span>${replyTo.text}</span><button id="sb-rep-x" title="Cancel the reply">✕</button></div>`;
	/**
	 * What to send in `chat`: the text, after the line of the message it answers when a reply was started.
	 * @param {string} chat
	 * @param {string} text
	 * @param {number} max
	 */
	function withReply(chat, text, max) {
		if (!replyTo || replyTo.chat !== chat) {
			return text;
		}
		const r = replyTo;
		replyTo = null;
		return `> ${r.name}: ${r.text}\n${text}`.slice(0, max);
	}
	/**
	 * Asks before deleting one message, then deletes it for you (see deleteMessages).
	 * @param {string} k its key
	 */
	function askDelete(k) {
		const h = hist.find((x) => x.k === k);
		if (!h) {
			return;
		}
		let keeps = `${nameOf(h.MemberNumber)} still has it`;
		if (h.group) {
			keeps = 'everyone else in the group still has it';
		} else if (h.whisper) {
			keeps = `${nameOf(h.MemberNumber)} and the room's chat still have it`;
		}
		const text = textOf(h);
		askBox(
			html`<div class="sb-crop-card">
			<b>🗑 Delete this message?</b>
			<span class="sb-quote">${text.length > 120 ? `${text.slice(0, 120)}…` : text}</span>
			<span class="sb-hint" style="text-align:center">It goes from your SlimeBeep only: ${keeps}.</span>
			<div class="sb-crop-btns"><button class="sb-pill" data-act="cancel">Cancel</button><button class="sb-go sb-danger" data-act="go">🗑 Delete</button></div>
		</div>`,
			(act, close) => {
				if (act !== 'go') {
					return;
				}
				close();
				deleteMessages((x) => x.k === k);
				render(true);
			},
		);
	}
	/** @type {AudioContext | null} Made on the first chime. */
	let audioCtx = null;
	/** Plays a short two-note sound. */
	function chime() {
		try {
			const ac = audioCtx || (audioCtx = new AudioContext());
			for (const [f, at] of [
				[880, 0],
				[1320, 0.09],
			]) {
				const o = ac.createOscillator(),
					g = ac.createGain();
				o.type = 'sine';
				o.frequency.value = f;
				g.gain.setValueAtTime(0.0001, ac.currentTime + at);
				g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + at + 0.02);
				g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + 0.18);
				o.connect(g).connect(ac.destination);
				o.start(ac.currentTime + at);
				o.stop(ac.currentTime + at + 0.2);
			}
		} catch (e) {
			/* no sound, no matter */
		}
	}

	/**
	 * One-to-one chats from `hist`, newest first.
	 * @returns {{ n: number, name: string, last: HistEntry, unread: number }[]}
	 */
	function chats() {
		/** @type {Map<number, { n: number, name: string | null, last: HistEntry, unread: number }>} */
		const by = new Map();
		for (const b of log()) {
			if (b.group || isReaction(b)) {
				continue;
			}
			const c = by.get(b.MemberNumber) || { n: b.MemberNumber, name: null, last: b, unread: 0 };
			if (!b.Sent) {
				c.name = b.MemberName;
			}
			c.last = b;
			if (unread(b)) {
				c.unread++;
			}
			by.set(b.MemberNumber, c);
		}
		return [...by.values()].map((c) => ({ ...c, name: c.name || nameOf(c.n) })).sort((a, b) => b.last.Time - a.last.Time);
	}

	/**
	 * Where an online friend is, for the lists.
	 * @param {Friend | undefined} f
	 */
	const where = (f) => {
		if (!f) {
			return 'Offline';
		}
		if (f.ChatRoomName) {
			return `${f.Private ? '🔒' : '📍'} ${f.ChatRoomName}`;
		}
		return f.Private ? '🔒 Private room' : '🏠 Not in a room';
	};

	/**
	 * Redraws the panel for the current `tab` and `thread`.
	 * @param {boolean} [keepScroll] keep the scroll position (a redraw for new data, not navigation)
	 * @returns {void}
	 */
	function render(keepScroll) {
		const view = $('sb-view');
		// The music player's share button follows the chat that is open.
		setTimeout(drawMusic, 0);
		// The emoji picker closes when no chat box is left after the redraw.
		setTimeout(() => {
			if (!$('sb-text')) {
				closeEmoji();
			}
		}, 0);
		showMe();
		if (!loggedIn()) {
			setHtml(view, html`<div class="sb-empty">💤 Log in and SlimeBeep wakes up.</div>`);
			return;
		}
		if (thread !== null) {
			renderThread(keepScroll);
			return;
		}
		const unreadChats = log().filter((h) => !h.group && unread(h)).length;
		const unreadGroups = log().filter((h) => h.group && unread(h)).length;
		/** @param {string} t */
		const on = (t) => (tab === t || (t === 'groups' && tab === 'newgc') ? 'on' : '');
		/** @param {number} n */
		const count = (n) => n > 0 && html`<i>${n}</i>`;
		const tabs = html`<div class="sb-tabs">
			<button data-tab="chats" class="${on('chats')}" title="Chats">💬 Chats${count(unreadChats)}</button>
			<button data-tab="groups" class="${on('groups')}" title="Group chats">👥 Groups${count(unreadGroups)}</button>
			<button data-tab="friends" class="${on('friends')}" title="Friends online">💖${count(friends.length)}</button>
			<button data-tab="wave" class="${on('wave')}" title="WaveBeep: one beep to many friends">🌊 Wave</button>
			<button data-tab="bug" class="${on('bug')}" title="Report a bug">🐞</button>
		</div>`;
		const body = $('sb-body');
		const scroll = keepScroll && body ? body.scrollTop : 0;
		const page = pageState(tab);
		if (tab === 'newgc') {
			setHtml(view, html`${tabs}<div class="sb-body sb-group" id="sb-body">${newGroupHtml()}</div>`);
		} else if (tab === 'wave') {
			setHtml(view, html`${tabs}<div class="sb-body sb-group" id="sb-body">${groupHtml()}</div>`);
		} else if (tab === 'bug') {
			setHtml(view, html`${tabs}<div class="sb-body sb-group" id="sb-body">${bugHtml()}</div>`);
		} else if (tab === 'invitefor') {
			setHtml(view, html`${tabs}<div class="sb-body sb-group" id="sb-body">${inviteForHtml()}</div>`);
		} else {
			const q = search.toLowerCase();
			const list = {
				chats: {
					rows: chatRows,
					what: 'chats',
					empty: '🫧 No beeps yet. Pick someone in 💖 to say hi!',
					none: '🫧 No beeps yet. Pick someone in 💖 to say hi!',
				},
				groups: {
					rows: groupRows,
					what: 'group chats',
					empty: '👥 No group chats yet. Make one with your SlimeBeep friends!',
					none: 'No group by that name.',
				},
				friends: { rows: friendRows, what: 'friends', empty: '🌙 None of your friends are online.', none: 'Nobody by that name.' },
			}[tab] || { rows: friendRows, what: 'chats', empty: '🌙 None of your friends are online.', none: 'Nobody by that name.' };
			const rows = list.rows(q);
			const what = list.what;
			const empty = q ? list.none : list.empty;
			setHtml(
				view,
				html`${tabs}<div class="sb-body" id="sb-body">
				${tab === 'groups' && groupsTop()}
				${tab === 'friends' && loggedIn() && meRow()}
				<input class="sb-search" id="sb-search" placeholder="🔍 Search ${what}…" value="${search}">
				${(tab === 'chats' || tab === 'groups') && hist.some(unread) && html`<button class="sb-pill sb-readall" id="sb-readall">✓ Mark all as read</button>`}
				${rows.length ? rows : html`<div class="sb-empty">${empty}</div>`}
			</div>`,
			);
			if ($('sb-readall')) {
				$('sb-readall').addEventListener('click', markAllRead);
			}
			const s = $input('sb-search');
			s.addEventListener('input', () => {
				search = s.value;
				render();
				const again = $input('sb-search');
				again.focus();
				again.setSelectionRange(search.length, search.length);
			});
		}
		if (keepScroll) {
			$('sb-body').scrollTop = scroll;
		}
		for (const b of $$(view, '[data-tab]')) {
			b.addEventListener('click', () => {
				tab = b.dataset.tab || 'chats';
				search = '';
				render();
			});
		}
		for (const r of $$(view, '[data-open]')) {
			r.addEventListener('click', () => {
				const v = r.dataset.open || '';
				thread = v.startsWith('g:') ? v : Number(v);
				threadPin = undefined;
				render();
			});
		}
		if ($('sb-merow')) {
			$('sb-merow').addEventListener('click', (e) => {
				if (targetOf(e).closest('#sb-achbtn')) {
					openAchievements();
				} else {
					openStatus();
				}
			});
		}
		if ($('sb-newgc')) {
			$('sb-newgc').addEventListener('click', () => {
				tab = 'newgc';
				render();
			});
		}
		if (tab === 'groups' && $('sb-join')) {
			wireGroupsTop();
		}
		if (tab === 'newgc') {
			wireNewGroup();
		}
		if (tab === 'wave') {
			wireGroup();
		}
		if (tab === 'bug') {
			wireBug();
		}
		if (tab === 'invitefor') {
			wireInviteFor();
		}
		restorePage(tab, page);
	}

	/**
	 * Where a page in #sb-body was: its scroll position and the values of its ticked boxes.
	 * @typedef {{ scroll: number, ticked: string[] }} PageState
	 */
	/**
	 * The state of the page in #sb-body, if that page is `key` (so the coming draw is a redraw for new
	 * data, not navigation).
	 * @param {string} key
	 * @returns {PageState | null}
	 */
	function pageState(key) {
		const body = $('sb-body');
		if (!body || body.dataset.page !== key) {
			return null;
		}
		return { scroll: body.scrollTop, ticked: $$inputs(body, 'label input[type=checkbox][value]:checked').map((b) => b.value) };
	}
	/**
	 * Marks the new #sb-body as page `key` and puts back what pageState saved. Ticks go back through a
	 * change event, so counts and buttons follow.
	 * @param {string} key
	 * @param {PageState | null} state
	 */
	function restorePage(key, state) {
		const body = $('sb-body');
		if (!body) {
			return;
		}
		body.dataset.page = key;
		if (!state) {
			return;
		}
		for (const b of $$inputs(body, 'label input[type=checkbox][value]')) {
			if (!b.checked && !b.disabled && state.ticked.includes(b.value)) {
				b.checked = true;
				b.dispatchEvent(new Event('change'));
			}
		}
		body.scrollTop = state.scroll;
	}

	/** The 📌 by a pinned chat's time in the lists. */
	const pinMark = html`<span class="sb-pinned" title="Pinned">📌</span> `;
	/**
	 * Rows of the 💬 Chats tab, pinned first, filtered by search `q`.
	 * @param {string} q
	 */
	function chatRows(q) {
		const rows = chats()
			.filter((c) => !q || c.name.toLowerCase().includes(q) || String(c.n).includes(q))
			.map((c) => {
				const online = friends.some((f) => f.MemberNumber === c.n);
				const text = replyBody(textOf(c.last));
				const pinned = isPinned(`n:${c.n}`);
				return {
					pinned,
					time: new Date(c.last.Time).getTime(),
					html: html`<div class="sb-row" data-open="${c.n}">${avatar(c.n, c.name)}
				<div class="sb-main"><div class="sb-name">${online ? html`<span class="sb-on" title="Online"></span>` : html`<span class="sb-off" title="Offline"></span>`}${c.name}</div>
				<div class="sb-sub">${c.last.Sent && 'You: '}${text}</div></div>
				<div class="sb-side">${pinned && pinMark}${timeOf(c.last.Time)}${c.unread > 0 && html`<br><span class="sb-dot">${c.unread}</span>`}</div></div>`,
				};
			});
		return rows.sort(pinnedFirst).map((r) => r.html);
	}

	/**
	 * Rows of the 👥 Groups tab, pinned first, then newest message first, filtered by `q`.
	 * @param {string} q
	 */
	function groupRows(q) {
		const rows = [];
		for (const g of Object.values(groups)) {
			if (q && !g.name.toLowerCase().includes(q)) {
				continue;
			}
			const msgs = hist.filter((h) => h.group === g.id);
			const last = msgs[msgs.length - 1];
			const n = msgs.filter(unread).length;
			const pinned = isPinned(`g:${g.id}`);
			rows.push({
				pinned,
				time: last ? last.Time : 0,
				html: html`<div class="sb-row" data-open="g:${g.id}">${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name} <small style="font-weight:normal;color:#c08aaa">${g.members.length}</small></div>
				<div class="sb-sub">${lastLine(last)}</div></div>
				<div class="sb-side">${pinned && pinMark}${last && timeOf(last.Time)}${n > 0 && html`<br><span class="sb-dot">${n}</span>`}</div></div>`,
			});
		}
		return rows.sort(pinnedFirst).map((r) => r.html);
	}
	/**
	 * The preview line of a group: "Name: text" of its last message.
	 * @param {HistEntry | undefined} last
	 */
	function lastLine(last) {
		if (!last) {
			return 'No messages yet';
		}
		if (last.sys) {
			return textOf(last);
		}
		return `${last.Sent ? 'You' : last.MemberName}: ${replyBody(textOf(last))}`;
	}

	/**
	 * Checkbox list of online friends (SlimeBeep users first) for inviting.
	 * @param {number[]} [exclude] member numbers left out
	 */
	function pickList(exclude = []) {
		const rows = friends
			.filter((f) => !exclude.includes(f.MemberNumber))
			.sort((a, b) => Number(peers.has(b.MemberNumber)) - Number(peers.has(a.MemberNumber)) || a.MemberName.localeCompare(b.MemberName))
			.map((f) => {
				const has = peers.has(f.MemberNumber);
				return html`<label><input type="checkbox" value="${f.MemberNumber}">${avatar(f.MemberNumber, f.MemberName)}
				<span class="sb-main" style="margin-left:8px"><span class="sb-name">${f.MemberName} ${has && '🫧'}</span>
				<span class="sb-sub" style="display:block">${has ? 'Has SlimeBeep: gets an invite card' : `Gets a beep with the code (${PLAIN_MAX} like that at a time)`}</span></span></label>`;
			});
		return rows.length ? rows : html`<div class="sb-empty">🌙 No online friends to add right now.</div>`;
	}
	/** Wires the 🔍 button that asks friends whether they have SlimeBeep (findPeers). */
	function wireFind() {
		$('sb-gc-find').addEventListener('click', () => {
			const n = findPeers();
			notify(n ? `🔍 Asking ${n} friend${n === 1 ? '' : 's'}…` : 'Everyone online is checked');
			setTimeout(
				() => {
					if (isOpen()) {
						render(true);
					}
				},
				2500 + n * 250,
			);
		});
	}

	/** HTML for the top of 👥 Groups: pending invitations and the join-by-code box. */
	function groupsTop() {
		const inv = invitations
			.filter((i) => !groups[codeGroup(i.code)])
			.map(
				(i, n) => html`<div class="sb-row" style="cursor:default">${avatar(i.from, i.fromName)}
			<div class="sb-main"><div class="sb-name">${i.name}</div><div class="sb-sub">Invite from ${i.fromName}</div></div>
			<div class="sb-side" style="display:flex;gap:3px"><button class="sb-go" data-join="${n}">Join</button><button class="sb-pill" data-dismiss="${n}" title="Dismiss">✕</button></div></div>`,
			);
		const httpNote =
			!secure() &&
			html`<div class="sb-hint" style="margin:0 2px 6px">🔒 Group chats need the game's secure address: <a href="${httpsUrl()}">open it with https</a> (you'll log in again there).</div>`;
		return html`${httpNote}<button class="sb-pill" id="sb-newgc" style="width:100%;margin:2px 0 6px">👥 New group chat</button>
			<div class="sb-line" style="margin:0 0 6px"><input class="sb-search" id="sb-join-code" placeholder="Have a code? SB-…" style="margin:0"><button class="sb-pill" id="sb-join">Join</button></div>
			${inv.length > 0 && html`<div class="sb-hint" style="margin:2px 2px 0">📨 Invitations</div>${inv}`}`;
	}
	/** Wires groupsTop's buttons. */
	function wireGroupsTop() {
		const list = invitations.filter((i) => !groups[codeGroup(i.code)]);
		for (const b of $$($('sb-view'), '[data-join]')) {
			b.addEventListener('click', () => {
				const i = list[Number(b.dataset.join)];
				if (i) {
					joinCode(i.code, (gid) => {
						thread = `g:${gid}`;
						render();
					});
				}
			});
		}
		for (const b of $$($('sb-view'), '[data-dismiss]')) {
			b.addEventListener('click', () => {
				const i = list[Number(b.dataset.dismiss)];
				invitations = invitations.filter((x) => x !== i);
				saveGC();
				render(true);
			});
		}
		$('sb-join').addEventListener('click', () =>
			joinCode($input('sb-join-code').value, (gid) => {
				thread = `g:${gid}`;
				render();
			}),
		);
		$('sb-join-code').addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				$('sb-join').click();
			}
		});
	}

	/** HTML of the new group form. */
	function newGroupHtml() {
		return html`<div class="sb-line"><button class="sb-pill" id="sb-gc-back">‹ Back</button><b>👥 New group chat</b></div>
			<div class="sb-hint" style="margin:4px 0 6px">Up to ${LIMITS.members} people with SlimeBeep, friends or not. Tick friends to invite them now (🫧 have SlimeBeep already); anyone else can join with a code from the group's 👥 page.</div>
			<input class="sb-search" id="sb-gc-name" maxlength="${LIMITS.name}" placeholder="Group name (optional)">
			<label><input type="checkbox" id="sb-gc-open"><span>Anyone can invite<span class="sb-hint" style="display:block">Otherwise only you and the admins you pick can add people.</span></span></label>
			<div class="sb-line"><b>Invite friends</b><button class="sb-pill" id="sb-gc-find">🔍 Find SlimeBeep friends</button></div>
			${pickList()}
			<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span id="sb-gc-count"></span><button class="sb-go" id="sb-gc-make">Create 👥</button></div>`;
	}

	/** Wires the new group form. */
	function wireNewGroup() {
		const boxes = () => $$inputs($('sb-body'), 'label input[type=checkbox][value]:not(:disabled)');
		const update = () => {
			const n = boxes().filter((b) => b.checked).length;
			$('sb-gc-count').textContent = n ? `${n} to invite` : 'Just you for now';
			capPlain(boxes(), n >= LIMITS.members - 1);
		};
		for (const b of boxes()) {
			b.addEventListener('change', update);
		}
		$('sb-gc-back').addEventListener('click', () => {
			tab = 'groups';
			render();
		});
		wireFind();
		$('sb-gc-make').addEventListener('click', () => {
			const picked = boxes()
				.filter((b) => b.checked)
				.map((b) => Number(b.value));
			const name = clean($input('sb-gc-name').value, LIMITS.name) || 'Group chat';
			$input('sb-gc-make').disabled = true;
			notify('👥 Making the group…');
			createGroup(name, picked, $input('sb-gc-open').checked, (id) => {
				notify(`👥 ${name} created`);
				tab = 'groups';
				thread = `g:${id}`;
				render();
			});
			setTimeout(() => {
				if ($('sb-gc-make')) {
					$input('sb-gc-make').disabled = false;
				}
			}, 8000);
		});
		update();
	}

	/** Shows the last invite code made on the members page (lastCode). */
	function showCode() {
		const out = $('sb-gm-out');
		const k = lastCode;
		if (!out || !k || !membersOpen || k.id !== membersOpen) {
			return;
		}
		setHtml(
			out,
			html`<div class="sb-row" style="cursor:default;display:block"><code style="font-size:13px;user-select:all">${k.code}</code>
			<div class="sb-hint">${k.forWho ? `Only #${k.forWho} can use it, once.` : 'Anyone with it can join, for 7 days (20 people at most).'} They paste it in 👥 Groups.</div>
			<button class="sb-pill" id="sb-gm-copy" style="margin-top:4px">📋 Copy</button></div>`,
		);
		$('sb-gm-copy').addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(k.code);
				notify('📋 Code copied');
			} catch (e) {
				notify('Select the code and copy it');
			}
		});
	}

	/** @type {string | null} Group whose members page is open. */
	let membersOpen = null;
	/** @type {{ id: string, code: string, forWho: number | null } | null} The last invite code made on a members page. */
	let lastCode = null;
	/**
	 * A group's members page: roles, name, picture, invite settings, invite codes and friend invites.
	 * @param {string} id
	 */
	function renderMembers(id) {
		const g = groups[id];
		const me = Player.MemberNumber;
		const admin = isAdmin(g, me);
		const owner = g.owner === me;
		const view = $('sb-view');
		// Typed text and focus survive the redraw.
		/** @type {Record<string, string>} */
		const typing = {};
		for (const k of ['sb-gm-name', 'sb-gm-for']) {
			if ($(k) && $(k).dataset.touched) {
				typing[k] = $input(k).value;
			}
		}
		const focused = document.activeElement && document.activeElement.id;
		const page = pageState(`m:${id}`);
		/** @param {number} n */
		const on = (n) => n === me || (g.online || []).includes(n);
		const rows = g.members
			.slice()
			.sort(
				(a, b) =>
					Number(on(b.n)) - Number(on(a.n)) ||
					Number(b.n === g.owner) - Number(a.n === g.owner) ||
					Number(isAdmin(g, b.n)) - Number(isAdmin(g, a.n)),
			)
			.map((m) => {
				const n = m.n;
				const role = { owner: '👑 Owner', admin: '⭐ Admin', member: 'Member' }[roleOf(g, n)];
				const acts = [];
				if (n !== me && n !== g.owner) {
					if (admin && !isAdmin(g, n) && g.admins.length < LIMITS.admins) {
						acts.push(html`<button class="sb-pill" data-act="up" data-n="${n}" title="Make admin">⭐</button>`);
					}
					if (owner && isAdmin(g, n)) {
						acts.push(html`<button class="sb-pill" data-act="down" data-n="${n}" title="Take admin">✩</button>`);
					}
					if ((admin && !isAdmin(g, n)) || owner) {
						acts.push(html`<button class="sb-pill" data-act="kick" data-n="${n}" title="Remove">✕</button>`);
					}
					if (owner) {
						acts.push(html`<button class="sb-pill" data-act="own" data-n="${n}" title="Make owner">👑</button>`);
					}
				}
				const dot = on(n) ? html`<span class="sb-on" title="Online"></span>` : html`<span class="sb-off" title="Offline"></span>`;
				return html`<div class="sb-row" style="cursor:default">${avatar(n, memberName(g, n))}
					<div class="sb-main"><div class="sb-name">${dot}${memberName(g, n)}${keyMark(m)}${peers.has(n) && ' 🫧'}</div><div class="sb-sub">${role} · #${n}${!on(n) && ' · offline'}</div>${on(n) && statusLine(n)}</div>
					<div class="sb-side" style="display:flex;gap:3px">${acts}</div></div>`;
			});
		const invite = canInvite(g, me) && g.members.length < LIMITS.members;
		const memberNums = g.members.map((m) => m.n);
		const settings = admin
			? html`<div class="sb-line"><input class="sb-search" id="sb-gm-name" maxlength="${LIMITS.name}" value="${g.name}" style="margin:0"><button class="sb-pill" id="sb-gm-rename">Rename</button></div>
				<div class="sb-line"><span>🖼 Group picture</span><span style="display:flex;gap:4px">${g.pic && html`<button class="sb-pill" id="sb-gm-picoff">Remove</button>`}<button class="sb-pill" id="sb-gm-pic">${g.pic ? 'Change' : 'Add'}</button></span></div>
				<label><input type="checkbox" id="sb-gm-open" ${g.open && 'checked'}><span>Anyone can invite</span></label>`
			: html`<div class="sb-hint">${g.open ? 'Anyone can invite people here.' : 'Only admins can invite people here.'}</div>`;
		const inviting =
			invite &&
			html`<div class="sb-line"><b>🔗 Invite with a code</b></div>
				<div class="sb-hint">Works for anyone with SlimeBeep, friends or not. ${admin && 'Put a member number to make it work for that one person only.'}</div>
				<div class="sb-line">${admin ? html`<input class="sb-search" id="sb-gm-for" placeholder="Member # (optional)" style="margin:0;width:150px">` : html`<span></span>`}<button class="sb-go" id="sb-gm-code">Make a code</button></div>
				<div id="sb-gm-out"></div>
				<div class="sb-line"><b>Invite friends</b><button class="sb-pill" id="sb-gc-find">🔍 Find 🫧</button></div>${pickList(memberNums)}
				<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span></span><button class="sb-go" id="sb-gm-add" disabled>Send invites</button></div>`;
		setHtml(
			view,
			html`
			<div class="sb-thead"><button id="sb-back" title="Back to the chat">${ICONS.back}</button>${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name}</div><div class="sb-sub">${g.members.length} / ${LIMITS.members} members</div></div></div>
			<div class="sb-body sb-group" id="sb-body">
				${settings}
				${rows}
				${inviting}
			</div>`,
		);
		for (const k of ['sb-gm-name', 'sb-gm-for']) {
			const el = $input(k);
			if (!el) {
				continue;
			}
			if (k in typing) {
				el.value = typing[k];
				el.dataset.touched = '1';
			}
			el.addEventListener('input', () => {
				el.dataset.touched = '1';
			});
			if (focused === k) {
				el.focus();
			}
		}
		$('sb-back').addEventListener('click', () => {
			membersOpen = null;
			render();
		});
		/** @param {object} x a message for the relay */
		const act = (x) => {
			relaySend(id, x);
		};
		for (const b of $$(view, '[data-act]')) {
			b.addEventListener('click', () => {
				const n = Number(b.dataset.n);
				if (b.dataset.act === 'up') {
					act({ t: 'admin', member: n, on: true });
				}
				if (b.dataset.act === 'down') {
					act({ t: 'admin', member: n, on: false });
				}
				if (b.dataset.act === 'kick') {
					act({ t: 'kick', member: n });
				}
				if (b.dataset.act === 'own') {
					act({ t: 'owner', member: n });
				}
			});
		}
		if ($('sb-gm-rename')) {
			$('sb-gm-rename').addEventListener('click', () => {
				const name = clean($input('sb-gm-name').value, LIMITS.name);
				if (name && name !== g.name) {
					act({ t: 'rename', name });
				}
			});
		}
		if ($('sb-gm-open')) {
			$('sb-gm-open').addEventListener('change', (e) => act({ t: 'open', on: inputOf(e).checked }));
		}
		if ($('sb-gm-pic')) {
			$('sb-gm-pic').addEventListener('click', () =>
				pickPicture((data) => {
					act({ t: 'gpic', pic: data });
					notify('✓ Group picture sent');
				}, 'Fit the group picture in the circle'),
			);
		}
		if ($('sb-gm-picoff')) {
			$('sb-gm-picoff').addEventListener('click', () => act({ t: 'gpic', pic: null }));
		}
		if (invite) {
			wireFind();
			$('sb-gm-code').addEventListener('click', () => {
				const want = $input('sb-gm-for') ? Number($input('sb-gm-for').value.replace(/\D/g, '')) : 0;
				const forWho = isNum(want) ? want : null;
				requestInvite(id, forWho, (code) => {
					if (!code) {
						return;
					}
					// Kept across redraws.
					lastCode = { id, code, forWho };
					showCode();
				});
			});
			showCode();
			const boxes = () => $$inputs($('sb-body'), 'label input[type=checkbox][value]:not(:disabled)');
			const room = LIMITS.members - g.members.length;
			const update = () => {
				const n = boxes().filter((b) => b.checked).length;
				$input('sb-gm-add').disabled = !n;
				capPlain(boxes(), n >= room);
			};
			for (const b of boxes()) {
				b.addEventListener('change', update);
			}
			$('sb-gm-add').addEventListener('click', () => {
				const picked = boxes()
					.filter((b) => b.checked)
					.map((b) => Number(b.value))
					.slice(0, room);
				inviteAll(id, picked);
				for (const b of boxes()) {
					b.checked = false;
				}
				update();
			});
		}
		restorePage(`m:${id}`, page);
	}

	/** Messages that came in below while the open chat was scrolled up (counted on its jump button). */
	let newBelow = 0;
	/**
	 * Where an open chat was scrolled to, taken before a redraw replaces it.
	 * @typedef {{ chat: string, top: number, atBottom: boolean, count: number }} MsgsPlace
	 */
	/**
	 * Whether a chat is scrolled to its newest message.
	 * @param {HTMLElement} box #sb-msgs
	 */
	const atBottom = (box) => box.scrollHeight - box.scrollTop - box.clientHeight < 40;
	/** @returns {MsgsPlace | null} where #sb-msgs is now, null when no chat is drawn */
	const msgsPlace = () => {
		const box = $('sb-msgs');
		return box && { chat: box.dataset.chat || '', top: box.scrollTop, atBottom: atBottom(box), count: Number(box.dataset.count) };
	};
	/**
	 * Scrolls a chat that was just drawn and wires its jump button. A chat opens at its newest message and
	 * follows new ones while you are there; when you scrolled up to read, a redraw leaves you where you were
	 * and "Jump to present" takes you down.
	 * @param {string} chat 'n:<member number>' or 'g:<group id>'
	 * @param {number} count messages in it
	 * @param {MsgsPlace | null} before where it was before the redraw
	 * @param {boolean} [keepScroll]
	 * @returns {HTMLElement} #sb-msgs
	 */
	function placeMsgs(chat, count, before, keepScroll) {
		const box = $('sb-msgs');
		const jump = $('sb-jump');
		box.dataset.chat = chat;
		box.dataset.count = String(count);
		const kept = keepScroll && before && before.chat === chat && !before.atBottom ? before : null;
		let follow = !kept;
		if (kept) {
			newBelow += Math.max(0, count - kept.count);
			box.scrollTop = kept.top;
		} else {
			newBelow = 0;
			box.scrollTop = box.scrollHeight;
		}
		const showJump = () => {
			jump.classList.toggle('on', !follow);
			const label = newBelow ? `${newBelow} new message${newBelow === 1 ? '' : 's'}` : 'Jump to present';
			setHtml(jump, html`${label} ${ICONS.down}`);
		};
		showJump();
		box.addEventListener('scroll', () => {
			follow = atBottom(box);
			if (follow) {
				newBelow = 0;
			}
			showJump();
		});
		jump.addEventListener('click', () => box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' }));
		for (const img of $$(box, '.sb-embed img')) {
			img.addEventListener('load', () => {
				const el = /** @type {HTMLImageElement} */ (img);
				picSizes.set(el.src, { w: el.naturalWidth, h: el.naturalHeight });
				if (follow) {
					box.scrollTop = box.scrollHeight;
				}
			});
			// A dead picture leaves only its link.
			img.addEventListener('error', () => img.parentElement && img.parentElement.remove());
		}
		for (const b of $$(box, '[data-play]')) {
			b.addEventListener('click', () => playLink(b.dataset.play || ''));
		}
		for (const b of $$(box, '[data-tr]')) {
			b.addEventListener('click', (e) => {
				e.preventDefault();
				toggleTr(b.dataset.tr || '');
			});
		}
		for (const b of $$(box, '[data-pic-once]')) {
			b.addEventListener('click', () => {
				shownOnce.add(b.dataset.picOnce || '');
				render(true);
			});
		}
		for (const b of $$(box, '[data-pic-trust]')) {
			b.addEventListener('click', () => {
				setOpt('trustedHosts', [...opts.trustedHosts, b.dataset.picTrust || '']);
				render(true);
			});
		}
		for (const b of $$(box, '[data-del]')) {
			b.addEventListener('click', () => askDelete(b.dataset.del || ''));
		}
		for (const b of $$(box, '[data-rep]')) {
			b.addEventListener('click', () => startReply(b.dataset.rep || ''));
		}
		if ($('sb-rep-x')) {
			$('sb-rep-x').addEventListener('click', () => {
				replyTo = null;
				render(true);
			});
		}
		// Touch screens have no hover: tapping a message shows its 🗑.
		box.addEventListener('click', (e) => {
			const t = targetOf(e);
			const bubble = t.closest('.sb-b');
			if (!bubble || !bubble.querySelector('.sb-del') || t.closest('a, button, img')) {
				return;
			}
			for (const other of $$(box, '.sb-b.sb-tap')) {
				if (other !== bubble) {
					other.classList.remove('sb-tap');
				}
			}
			bubble.classList.toggle('sb-tap');
		});
		return box;
	}

	/**
	 * Draws an open group chat.
	 * @param {boolean} [keepScroll]
	 * @returns {void}
	 */
	function renderGroupThread(keepScroll) {
		const mayFocus = wantsFocus();
		const id = String(thread).slice(2);
		const g = groups[id];
		if (!g) {
			thread = null;
			return render();
		}
		if (membersOpen === id) {
			return renderMembers(id);
		}
		const view = $('sb-view');
		const msgs = hist.filter((h) => h.group === id).sort((a, b) => a.Time - b.Time);
		for (const h of msgs) {
			markRead(h);
		}
		const before = msgsPlace();
		const draft = $input('sb-text') ? $input('sb-text').value : '';
		const names = g.members.filter((m) => m.n !== Player.MemberNumber).map((m) => memberName(g, m.n));
		const online = conns[id] && conns[id].ready;
		const here = new Set([...(g.online || []), Player.MemberNumber]).size;
		const status = online ? html`<span class="sb-on"></span>${here} online · ` : '⏳ connecting… · ';
		/**
		 * @param {HistEntry} h
		 * @param {number} i
		 */
		const bubble = (h, i) => {
			if (h.sys) {
				return html`<div class="sb-sys">${textOf(h)}</div>`;
			}
			const name = h.Sent ? myName() : memberName(g, h.MemberNumber) || h.MemberName;
			const r = splitReply(textOf(h));
			const body = r ? r.body : textOf(h);
			const act = asAction(body, name);
			const from = !h.Sent && !act && html`<span class="sb-from">${name}</span>`;
			const tr = !h.Sent && trLine(body, `g:${id}`, i >= msgs.length - AUTO_RECENT);
			const mention = !h.Sent && mentionsMe(h) && ' sb-mention';
			return html`<div class="sb-b ${h.Sent ? 'me' : 'them'}${act && ' sb-act'}${mention}">${from}${replyQuote(r)}${rich(act ?? body)}${tr}<em>${!h.Sent && trButton(body)}${timeOf(h.Time)}${msgButtons(h)}</em></div>`;
		};
		setHtml(
			view,
			html`
			<div class="sb-thead"><button id="sb-back" title="Back">${ICONS.back}</button>${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name}</div>
				<div class="sb-sub" title="${names.join(', ')}">${status}${g.members.length} members: You${names.length > 0 && `, ${names.join(', ')}`}</div></div>
				${trSettingsButton(`g:${id}`)}${muteButton(`g:${id}`)}${moreButton(`g:${id}`)}<button id="sb-members" title="Members and invites">👥</button><button id="sb-leave" title="${g.owner === Player.MemberNumber ? 'Leave or delete the group' : 'Leave the group'}">🚪</button></div>
			${jamLine(`g:${id}`)}
			<div class="sb-msgwrap"><div class="sb-msgs" id="sb-msgs">${msgs.length ? msgs.map(bubble) : html`<div class="sb-empty">🫧 Say hi to the group!</div>`}</div>
				<button class="sb-pill sb-jump" id="sb-jump"></button></div>
			${replyBar(`g:${id}`)}
			<div class="sb-compose">
				<button class="pin" id="sb-emo" title="Emoji">😊</button>${trWriteButton(`g:${id}`)}
				<textarea id="sb-text" maxlength="${LIMITS.text}" placeholder="Message ${g.name}…"></textarea>
				<button id="sb-send" title="Send (Enter)">${ICONS.send}</button>
			</div>`,
		);
		const box = placeMsgs(`g:${id}`, msgs.length, before, keepScroll);
		wireJamLine(`g:${id}`);
		const ta = $input('sb-text');
		ta.value = draft;
		$('sb-back').addEventListener('click', () => {
			thread = null;
			render();
		});
		$('sb-members').addEventListener('click', () => {
			membersOpen = id;
			render();
		});
		$('sb-mute').addEventListener('click', () => openNotify(`g:${id}`, g.name));
		$('sb-more').addEventListener('click', () => openChatMenu(`g:${id}`));
		$('sb-trset').addEventListener('click', () => openTranslate(`g:${id}`));
		if ($('sb-trw')) {
			$('sb-trw').addEventListener('click', () => translateDraft(`g:${id}`));
		}
		$('sb-leave').addEventListener('click', () => askGroup(id));
		$('sb-emo').addEventListener('click', () => toggleEmoji());
		const send = () => {
			const typed = command(ta.value);
			if (typed === null) {
				ta.value = '';
				return;
			}
			const text = clean(typed, LIMITS.text);
			if (!text) {
				return;
			}
			closeEmoji();
			closeAt();
			// What you send takes you back to the newest messages.
			box.scrollTop = box.scrollHeight;
			// Cleared first: sending can redraw the chat, which keeps what is in the box.
			ta.value = '';
			sendGroup(id, withReply(`g:${id}`, text, LIMITS.text)).catch((e) => warn(e, 'send'));
		};
		$('sb-send').addEventListener('click', send);
		wireAt(
			ta,
			g.members.filter((m) => m.n !== Player.MemberNumber).map((m) => ({ n: m.n, name: memberName(g, m.n) || `#${m.n}` })),
		);
		ta.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey && !e.defaultPrevented) {
				e.preventDefault();
				send();
			}
		});
		if (mayFocus) {
			ta.focus();
		}
	}

	/**
	 * The @ list of a group's box: typing @ shows the members whose name matches what follows it;
	 * a click, Enter or Tab writes "@Name ". Arrows move, Escape closes.
	 * @param {HTMLInputElement} ta the box ($input)
	 * @param {{ n: number, name: string }[]} members
	 */
	function wireAt(ta, members) {
		let picked = 0;
		/** @type {{ n: number, name: string }[]} */
		let shown = [];
		const query = () => {
			const m = /(^|\s)@([^\s@]{0,24})$/.exec(ta.value.slice(0, ta.selectionStart ?? ta.value.length));
			return m ? m[2].toLowerCase() : null;
		};
		/** @param {{ n: number, name: string }} who */
		const pick = (who) => {
			const at = ta.selectionStart ?? ta.value.length;
			const before = ta.value.slice(0, at).replace(/@[^\s@]{0,24}$/, `@${who.name} `);
			ta.value = before + ta.value.slice(at);
			ta.selectionStart = ta.selectionEnd = before.length;
			closeAt();
			ta.focus();
		};
		const draw = () => {
			const q = query();
			shown = q === null ? [] : members.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 6);
			if (!shown.length) {
				closeAt();
				return;
			}
			picked = Math.min(picked, shown.length - 1);
			let list = $('sb-at');
			if (!list) {
				const compose = ta.closest('.sb-compose');
				if (!compose) {
					return;
				}
				list = document.createElement('div');
				list.id = 'sb-at';
				compose.appendChild(list);
			}
			setHtml(
				list,
				html`${shown.map((m, i) => html`<button data-at="${i}" class="${i === picked && 'on'}">${avatar(m.n, m.name)}<span>${m.name}</span></button>`)}`,
			);
			for (const b of $$(list, '[data-at]')) {
				// mousedown: a click would take the focus from the box first.
				b.addEventListener('mousedown', (e) => {
					e.preventDefault();
					pick(shown[Number(b.dataset.at)]);
				});
			}
		};
		ta.addEventListener('input', () => {
			picked = 0;
			draw();
		});
		ta.addEventListener('keydown', (e) => {
			if (!$('sb-at') || !shown.length) {
				return;
			}
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				picked = (picked + (e.key === 'ArrowDown' ? 1 : shown.length - 1)) % shown.length;
				draw();
			} else if (e.key === 'Enter' || e.key === 'Tab') {
				e.preventDefault();
				pick(shown[picked]);
			} else if (e.key === 'Escape') {
				e.preventDefault();
				closeAt();
			}
		});
	}
	/** Closes the @ list of a group's box. */
	const closeAt = () => {
		const list = $('sb-at');
		if (list) {
			list.remove();
		}
	};

	/**
	 * Rows of the 💖 tab: online friends, then offline ones greyed out, filtered by `q`.
	 * @param {string} q
	 */
	function friendRows(q) {
		/**
		 * @param {string} name
		 * @param {number} n
		 * @param {string} [room]
		 */
		const match = (name, n, room = '') => !q || name.toLowerCase().includes(q) || String(n).includes(q) || room.toLowerCase().includes(q);
		const on = friends
			.filter((f) => match(f.MemberName, f.MemberNumber, f.ChatRoomName || ''))
			.sort((a, b) => a.MemberName.localeCompare(b.MemberName))
			.map(
				(f) => html`<div class="sb-row" data-open="${f.MemberNumber}">${avatar(f.MemberNumber, f.MemberName)}
				<div class="sb-main"><div class="sb-name"><span class="sb-on"></span>${f.MemberName}${{ Lover: ' 💞', Submissive: ' 🎀' }[f.Type || '']}${peers.has(f.MemberNumber) && html` <span title="Has SlimeBeep">🫧</span>`}</div>
				<div class="sb-sub">${where(f)}${!!f.ChatRoomMemberCount && ` · ${f.ChatRoomMemberCount}/${f.ChatRoomLimit || '?'}`}</div>${statusLine(f.MemberNumber)}</div>
				<div class="sb-side">#${f.MemberNumber}</div></div>`,
			);
		const onlineNums = new Set(friends.map((f) => f.MemberNumber));
		const all = Player.FriendNames && typeof Player.FriendNames.forEach === 'function' ? [...Player.FriendNames.entries()] : [];
		const off = all
			.filter(([n, name]) => isNum(n) && !onlineNums.has(n) && n !== Player.MemberNumber && match(String(name || ''), n))
			.sort((a, b) => String(a[1] || '').localeCompare(String(b[1] || '')))
			.map(
				([n, name]) => html`<div class="sb-row offline" data-open="${n}">${avatar(n, name)}
				<div class="sb-main"><div class="sb-name"><span class="sb-off"></span>${name || `#${n}`}${peers.has(n) && html` <span title="Has SlimeBeep">🫧</span>`}</div>
				<div class="sb-sub">Offline</div></div><div class="sb-side">#${n}</div></div>`,
			);
		if (!off.length) {
			return on;
		}
		return [...on, html`<div class="sb-hint" style="margin:8px 4px 2px">Offline (${off.length})</div>`, ...off];
	}

	/**
	 * The 📍 room line under a beep (with Join), shown when the room differs from that side's previous beep.
	 * @param {HistEntry} b
	 * @param {HistEntry[]} msgs the chat
	 * @param {number} i b's index in msgs
	 */
	function roomLine(b, msgs, i) {
		const room = typeof b.Message === 'string' && typeof b.ChatRoomName === 'string' ? b.ChatRoomName.trim() : '';
		if (!room) {
			return '';
		}
		const prev = msgs
			.slice(0, i)
			.reverse()
			.find((x) => x.Sent === b.Sent);
		if (prev && (prev.ChatRoomName || '').trim() === room) {
			return '';
		}
		const join = !b.Sent && html` <button class="sb-pill sb-joinroom" data-room="${room}">Join</button>`;
		return html`<span class="sb-room">📍 ${b.Sent ? 'invited to' : 'in'} ${room}${join}</span>`;
	}

	/** When joinRoom last ran (one try per 3 s). */
	let joiningRoom = 0;
	/**
	 * Joins a chat room like the game's chat search: leaves the current room if the game allows it now,
	 * then sends ServerRoomJoin; the game handles the answer.
	 * @param {string} roomName
	 */
	async function joinRoom(roomName) {
		const name = String(roomName || '').trim();
		if (!name || !loggedIn() || Date.now() - joiningRoom < 3000) {
			return;
		}
		if (myRoom() === name) {
			return notify(`You're already in ${name}`);
		}
		const inRoom = typeof ChatRoomData !== 'undefined' && ChatRoomData;
		if (inRoom) {
			if (typeof CurrentScreen !== 'undefined' && CurrentScreen !== 'ChatRoom') {
				return notify('Go back to your room first, then join');
			}
			if (typeof ChatRoomCanLeave === 'function' && !ChatRoomCanLeave()) {
				return notify("You can't leave this room right now");
			}
			if (typeof Player.IsSlow === 'function' && Player.IsSlow()) {
				return notify("You're too slow to just walk out: leave the room first");
			}
			if (typeof ChatRoomLeave !== 'function' || typeof CommonSetScreen !== 'function') {
				return notify('⚠ The game changed: join from the room list');
			}
		}
		joiningRoom = Date.now();
		try {
			if (inRoom) {
				ChatRoomLeave();
				CommonSetScreen('Online', 'ChatSearch');
			}
			notify(`📍 Joining ${name}…`);
			if (typeof ServerRoomJoin === 'function') {
				const r = await ServerRoomJoin(name);
				// On failure, the error's name is the server's answer (RoomFull, RoomLocked, CannotFindRoom…).
				if (r && r.error) {
					if (typeof ChatSearchSendToast === 'function') {
						ChatSearchSendToast(r.error.name || '');
					}
					notify(
						`⚠ Couldn't join ${name}${
							/^[A-Za-z]+$/.test(r.error.name || '')
								? ` (${String(r.error.name)
										.replace(/^Room|Error$/g, '')
										.replace(/([a-z])([A-Z])/g, '$1 $2')
										.toLowerCase()})`
								: ''
						}`,
					);
				}
			} else if (typeof ServerSend === 'function') {
				ServerSend('ChatRoomJoin', { Name: name });
			}
		} catch (e) {
			warn(e, 'join room');
			notify(`⚠ Couldn't join ${name}`);
		}
	}

	/** @type {boolean | undefined} 📍 set for the next beep in the open chat (undefined: opts.shareRoom). */
	let threadPin;
	/**
	 * Draws an open chat (one-to-one, or hands over to renderGroupThread).
	 * @param {boolean} [keepScroll]
	 * @returns {void}
	 */
	function renderThread(keepScroll) {
		if (typeof thread === 'string') {
			renderGroupThread(keepScroll);
			return;
		}
		const mayFocus = wantsFocus();
		const n = Number(thread);
		const view = $('sb-view');
		const msgs = log().filter((b) => b.MemberNumber === n && !b.group && !isReaction(b));
		// Opening the chat marks it read (in the game's log too).
		for (const b of msgs) {
			markRead(b);
		}
		const f = friends.find((x) => x.MemberNumber === n);
		if (f) {
			askStatus(n);
		}
		const before = msgsPlace();
		const draft = $input('sb-text') ? $input('sb-text').value : '';
		const room = myRoom();
		const pinOn = !!room && (threadPin ?? opts.shareRoom);
		const waitingHere = waiting.filter((w) => w.n === n);
		const offline = isOffline(n);
		/** @param {HistEntry} b */
		const mailMark = (b) => {
			if (!b.mail) {
				return '';
			}
			const title = b.Sent
				? 'Left in their SlimeBeep mailbox while they were offline'
				: 'Left in your SlimeBeep mailbox while you were offline';
			return html`<span title="${title}">📬</span> `;
		};
		/** @param {HistEntry} b */
		const whisperMark = (b) => b.whisper && html`<span title="Whispered in a chat room">🤫</span> `;
		/** @param {HistEntry} b */
		const uncheckedMark = (b) =>
			b.unchecked && html`<span title="Their SlimeBeep has not told yours its key yet, so who sent this could not be checked">⚠</span> `;
		/** @type {HtmlValue} */
		let bubbles = !waitingHere.length && html`<div class="sb-empty">🫧 Say hi!</div>`;
		if (msgs.length) {
			bubbles = msgs.map((b, i) => {
				const r = splitReply(textOf(b));
				const body = r ? r.body : textOf(b);
				const act = asAction(body, b.Sent ? myName() : nameOf(n));
				const tr = !b.Sent && trLine(body, `n:${n}`, i >= msgs.length - AUTO_RECENT);
				return html`<div class="sb-b ${b.Sent ? 'me' : 'them'}${act && ' sb-act'}">${replyQuote(r)}${rich(act ?? body)}${tr}${roomLine(b, msgs, i)}<em>${!b.Sent && trButton(body)}${mailMark(b)}${whisperMark(b)}${uncheckedMark(b)}${timeOf(b.Time)}${msgButtons(b)}</em></div>`;
			});
		}
		const waitingBubbles = waitingHere.map(
			(w) =>
				html`<div class="sb-b me sb-wait">${w.text}<em>⏳ sends when they're online · <a href="#" data-cancel="${w.id}">cancel</a></em></div>`,
		);
		const pinTitle = room ? `Let them join me: adds a button to join you in "${room}"` : "You're not in a chat room";
		const near = sameRoom(n);
		const whisper = near && opts.roomWhisper;
		let placeholder = `Beep ${nameOf(n)}…`;
		if (whisper) {
			placeholder = `Whisper ${nameOf(n)}…`;
		} else if (offline) {
			placeholder = `${nameOf(n)} is offline…`;
		}
		setHtml(
			view,
			html`
			<div class="sb-thead"><button id="sb-back" title="Back">${ICONS.back}</button>${avatar(n, nameOf(n))}
				<div class="sb-main"><div class="sb-name">${nameOf(n)} <small style="font-weight:normal;color:#c08aaa">#${n}</small></div>
				<div class="sb-sub">${f && html`<span class="sb-on"></span>`}${where(f)}</div>${!!f && statusLine(n)}</div>${trSettingsButton(`n:${n}`)}${muteButton(`n:${n}`)}${moreButton(`n:${n}`)}</div>
			${jamLine(`n:${n}`)}
			<div class="sb-msgwrap"><div class="sb-msgs" id="sb-msgs">${bubbles}${waitingBubbles}</div>
				<button class="sb-pill sb-jump" id="sb-jump"></button></div>
			${replyBar(`n:${n}`)}
			<div class="sb-compose">
				<button class="pin ${pinOn && 'on'}" id="sb-pin" ${!room && 'disabled'} title="${pinTitle}">📍</button>
				<button class="pin" id="sb-emo" title="Emoji">😊</button>${trWriteButton(`n:${n}`)}${near && html`<button class="pin ${whisper && 'on'}" id="sb-whisper" title="${whisper ? 'Whispering (click to beep instead)' : 'Beeping (click to whisper instead)'}">🤫</button>`}
				<textarea id="sb-text" maxlength="1000" placeholder="${placeholder}"></textarea>
				<button id="sb-send" title="Send (Enter)">${ICONS.send}</button>
			</div>`,
		);
		const box = placeMsgs(`n:${n}`, msgs.length + waitingHere.length, before, keepScroll);
		wireJamLine(`n:${n}`);
		const ta = $input('sb-text');
		ta.value = draft;
		$('sb-back').addEventListener('click', () => {
			thread = null;
			threadPin = undefined;
			render();
		});
		$('sb-pin').addEventListener('click', () => {
			threadPin = !pinOn;
			render(true);
		});
		if ($('sb-whisper')) {
			$('sb-whisper').addEventListener('click', () => {
				opts.roomWhisper = !opts.roomWhisper;
				saveOpts();
				render(true);
			});
		}
		$('sb-mute').addEventListener('click', () => openNotify(`n:${n}`, nameOf(n)));
		$('sb-more').addEventListener('click', () => openChatMenu(`n:${n}`));
		$('sb-trset').addEventListener('click', () => openTranslate(`n:${n}`));
		if ($('sb-trw')) {
			$('sb-trw').addEventListener('click', () => translateDraft(`n:${n}`));
		}
		for (const b of $$(view, '.sb-joinroom')) {
			b.addEventListener('click', (e) => {
				e.preventDefault();
				joinRoom(b.dataset.room || '');
			});
		}
		for (const a of $$(view, '[data-cancel]')) {
			a.addEventListener('click', (e) => {
				e.preventDefault();
				waiting = waiting.filter((w) => w.id !== a.dataset.cancel);
				saveWaiting();
				render(true);
			});
		}
		$('sb-emo').addEventListener('click', () => toggleEmoji());
		const send = () => {
			const typed = command(ta.value);
			if (typed === null) {
				ta.value = '';
				return;
			}
			if (!typed.trim()) {
				return;
			}
			const text = withReply(`n:${n}`, typed.trim(), 1000);
			closeEmoji();
			// What you send takes you back to the newest messages.
			box.scrollTop = box.scrollHeight;
			// Cleared first: a whisper redraws the chat while it is sent, and the redraw keeps what is in the box.
			ta.value = '';
			// In the same room, it's a whisper unless 🤫 is off (outListener adds it to this chat).
			if (opts.roomWhisper && sameRoom(n) && ChatRoomSendWhisper(n, text) === true) {
				return;
			}
			if (isOffline(n)) {
				queueBeep(n, text);
				return render(true);
			}
			// Read at send time so a quick second Enter doesn't add the room again.
			const invite = !!myRoom() && (threadPin ?? opts.shareRoom);
			beep(n, text, invite);
			unlock('fb');
			// 📍 applies to one beep.
			threadPin = false;
			sync();
			setTimeout(() => render(true), 50);
		};
		$('sb-send').addEventListener('click', send);
		ta.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				send();
			}
		});
		if (mayFocus) {
			ta.focus();
		}
	}

	/**
	 * Whether you and member `n` are in the same chat room, so a whisper reaches them.
	 * @param {number} n
	 */
	const sameRoom = (n) =>
		typeof ChatRoomSendWhisper === 'function' &&
		typeof ChatRoomCharacter === 'object' &&
		Array.isArray(ChatRoomCharacter) &&
		ServerPlayerIsInChatRoom() &&
		ChatRoomCharacter.some((C) => C.MemberNumber === n);
	/**
	 * Whether a friend is known to be offline.
	 * @param {number} n
	 */
	const isOffline = (n) => friendsKnown && isFriend(n) && !friends.some((f) => f.MemberNumber === n);
	/**
	 * Adds a beep for an offline friend to `waiting` and tries their mailbox.
	 * @param {number} n
	 * @param {string} text
	 */
	function queueBeep(n, text) {
		if (waiting.length >= 100) {
			return notify('⚠ Too many beeps waiting already');
		}
		waiting.push({ id: newId(), n, text: text.slice(0, 1000), at: Date.now() });
		saveWaiting();
		notify(`⏳ ${nameOf(n)} is offline: it goes out when they're back`);
		mailWaiting(true);
	}
	/** True while sendWaiting runs. */
	let sendingWaiting = false;
	/** Sends the `waiting` beeps whose friend is now online, opts.gap seconds apart. */
	async function sendWaiting() {
		if (sendingWaiting || !waiting.length || !loggedIn()) {
			return;
		}
		const ready = waiting.filter((w) => friends.some((f) => f.MemberNumber === w.n));
		if (!ready.length) {
			return;
		}
		sendingWaiting = true;
		try {
			for (const [i, w] of ready.entries()) {
				if (!waiting.includes(w)) {
					continue;
				} // cancelled meanwhile
				beep(w.n, w.text, false);
				waiting = waiting.filter((x) => x !== w);
				saveWaiting();
				if (i < ready.length - 1) {
					await new Promise((r) => setTimeout(r, opts.gap * 1000));
				}
			}
			sync();
			const names = [...new Set(ready.map((w) => nameOf(w.n)))];
			notify(`📨 Waiting beep${ready.length === 1 ? '' : 's'} sent to ${names.join(', ')}`);
			if (isOpen()) {
				render(true);
			}
		} finally {
			sendingWaiting = false;
		}
	}

	/** Google Translate's address for one text (the one the CATS add-on uses too). */
	const TRANSLATE_URL = 'https://translate-pa.googleapis.com/v1/translate';
	/** The public key of Google's own translate page; if Google changes it, translating just says it can't right now. */
	const TRANSLATE_KEY = 'AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA';
	/** Only the newest messages of a chat translate by themselves (older ones on a tap). */
	const AUTO_RECENT = 30;
	/** Languages to translate into: Google's code -> the language's own name. */
	const LANGS = {
		en: 'English',
		es: 'Español',
		fr: 'Français',
		de: 'Deutsch',
		it: 'Italiano',
		pt: 'Português',
		nl: 'Nederlands',
		pl: 'Polski',
		cs: 'Čeština',
		sv: 'Svenska',
		no: 'Norsk',
		da: 'Dansk',
		fi: 'Suomi',
		hu: 'Magyar',
		ro: 'Română',
		el: 'Ελληνικά',
		tr: 'Türkçe',
		ru: 'Русский',
		uk: 'Українська',
		ar: 'العربية',
		he: 'עברית',
		hi: 'हिन्दी',
		id: 'Bahasa Indonesia',
		ms: 'Bahasa Melayu',
		tl: 'Filipino',
		vi: 'Tiếng Việt',
		th: 'ไทย',
		ja: '日本語',
		ko: '한국어',
		'zh-CN': '中文 (简体)',
		'zh-TW': '中文 (繁體)',
	};
	/** The game's languages as Google's codes. */
	const GAME_LANGS = { EN: 'en', DE: 'de', FR: 'fr', RU: 'ru', CN: 'zh-CN', TW: 'zh-TW', UA: 'uk' };
	/**
	 * A language's name, or its code when it isn't one of LANGS.
	 * @param {string} code
	 */
	const langName = (code) => /** @type {Record<string, string>} */ (LANGS)[code] || code;
	/** Whether a code is one of LANGS. */
	const isLang = (/** @type {unknown} */ code) => typeof code === 'string' && Object.hasOwn(LANGS, code);
	/** The language CATS translates the room chat into, when it is installed; '' otherwise. */
	const catsLang = () => {
		try {
			const c = Player.CATS && Player.CATS.TranslatorModule && Player.CATS.TranslatorModule.google;
			return c && isLang(c.incomingTargetLang) ? String(c.incomingTargetLang) : '';
		} catch (e) {
			return '';
		}
	};
	/** The language picked by itself: CATS's, the game's, the browser's, or English. */
	const autoLang = () => {
		const game = typeof TranslationLanguage === 'string' ? /** @type {Record<string, string>} */ (GAME_LANGS)[TranslationLanguage] : '';
		const browser = (navigator.language || '').split('-')[0];
		return catsLang() || game || (isLang(browser) ? browser : 'en');
	};
	/** The language messages are translated into. */
	const trLang = () => (isLang(opts.translateTo) ? opts.translateTo : autoLang());
	/**
	 * A translation: its text and the language it came from; 'wait' while asked, 'fail' if it couldn't be done.
	 * @typedef {{ text: string, from: string } | 'wait' | 'fail'} Translation
	 */
	/** @type {Map<string, Translation>} Translations this visit, by `${language}|${text}`. */
	const translations = new Map();
	/** @type {Set<string>} Translations shown because their 🌐 was tapped (same keys). */
	const trShown = new Set();
	/** @type {[string, string][]} Translations waiting to be asked for, one at a time: [key, text]. */
	const trWaiting = [];
	/** Whether a translation is being asked for now. */
	let trBusy = false;
	/**
	 * Asks Google Translate for a text in another language.
	 * @param {string} text
	 * @param {string} to
	 * @param {string} [from] 'auto' to let Google tell
	 * @returns {Promise<{ text: string, from: string }>}
	 */
	async function translate(text, to, from = 'auto') {
		const query = new URLSearchParams({
			'params.client': 'gtx',
			dataTypes: 'TRANSLATION',
			key: TRANSLATE_KEY,
			'query.sourceLanguage': from,
			'query.targetLanguage': to,
			'query.text': text,
		});
		const r = await fetch(`${TRANSLATE_URL}?${query}`, { signal: AbortSignal.timeout(10000), credentials: 'omit' });
		if (!r.ok) {
			throw new Error(`translate: ${r.status}`);
		}
		const d = /** @type {{ translation?: unknown, sourceLanguage?: unknown } | null} */ (await r.json());
		if (!d || typeof d.translation !== 'string') {
			throw new Error('translate: no translation');
		}
		return { text: d.translation.slice(0, 2000), from: typeof d.sourceLanguage === 'string' ? d.sourceLanguage : '' };
	}
	/** Asks for the waiting translations one by one, and redraws as each arrives. */
	async function trPump() {
		if (trBusy) {
			return;
		}
		trBusy = true;
		while (trWaiting.length) {
			const [key, text] = /** @type {[string, string]} */ (trWaiting.shift());
			const to = key.slice(0, key.indexOf('|'));
			try {
				translations.set(key, await translate(text, to));
			} catch (e) {
				translations.set(key, 'fail');
			}
			if (isOpen() && thread !== null) {
				render(true);
			}
		}
		trBusy = false;
	}
	/**
	 * A message's translation, shown under it when its 🌐 was tapped or the chat translates by itself.
	 * @param {string} text
	 * @param {string} chat
	 * @param {boolean} recent among the chat's newest AUTO_RECENT messages
	 * @returns {HtmlValue}
	 */
	function trLine(text, chat, recent) {
		const key = `${trLang()}|${text}`;
		const tapped = trShown.has(key);
		if (!text.trim() || (!tapped && !(recent && opts.autoTranslate.includes(chat)))) {
			return '';
		}
		const t = translations.get(key);
		if (!t) {
			translations.set(key, 'wait');
			trWaiting.push([key, text]);
			trPump();
			return html`<div class="sb-tr">🌐 Translating…</div>`;
		}
		if (t === 'wait') {
			return html`<div class="sb-tr">🌐 Translating…</div>`;
		}
		if (t === 'fail') {
			return html`<div class="sb-tr">🌐 Couldn't translate right now</div>`;
		}
		if (t.from === trLang() || t.text === text) {
			// Already in your language: only a tap says so.
			return tapped && html`<div class="sb-tr">🌐 Already in ${langName(trLang())}</div>`;
		}
		return html`<div class="sb-tr">🌐 ${t.text}<small> · from ${langName(t.from)}</small></div>`;
	}
	/**
	 * The 🌐 under someone's message: translates it (tap again to hide).
	 * @param {string} text
	 * @returns {HtmlValue}
	 */
	const trButton = (text) =>
		!!text.trim() && html`<a href="#" class="sb-trbtn" data-tr="${text}" title="Translate (the text goes to Google Translate)">🌐</a> `;
	/**
	 * A tapped 🌐: shows or hides that message's translation; one that failed is asked for again.
	 * @param {string} text
	 */
	function toggleTr(text) {
		const key = `${trLang()}|${text}`;
		if (translations.get(key) === 'fail') {
			translations.delete(key);
			trShown.add(key);
		} else if (trShown.has(key)) {
			trShown.delete(key);
		} else {
			trShown.add(key);
		}
		render(true);
	}
	/**
	 * The 🌐 in a chat's top bar.
	 * @param {string} chat
	 * @returns {HtmlValue}
	 */
	const trSettingsButton = (chat) =>
		html`<button id="sb-trset" class="${opts.autoTranslate.includes(chat) && 'on'}" title="Translate">🌐</button>`;
	/**
	 * The 🌐 by the send button, when you write this chat in another language.
	 * @param {string} chat
	 * @returns {HtmlValue}
	 */
	const trWriteButton = (chat) =>
		isLang(opts.writeIn[chat]) &&
		html`<button class="pin" id="sb-trw" title="Translate what you wrote into ${langName(opts.writeIn[chat])}, to check before sending">🌐</button>`;
	/**
	 * 🌐 by the send button: what you wrote becomes the chat's language, for you to check and send.
	 * @param {string} chat
	 */
	async function translateDraft(chat) {
		const ta = $input('sb-text');
		const to = opts.writeIn[chat];
		const text = ta ? ta.value.trim() : '';
		if (!text || !isLang(to) || text.startsWith('/')) {
			return;
		}
		try {
			const t = await translate(text, to);
			const now = $input('sb-text');
			if (now && now.value.trim() === text) {
				now.value = t.text;
				now.focus();
				notify(`🌐 In ${langName(to)} now: check it, then send`);
			}
		} catch (e) {
			notify("⚠ Couldn't translate right now");
		}
	}
	/**
	 * The 🌐 box of a chat: translate it by itself, into which language, and the language you write it in.
	 * @param {string} chat
	 */
	function openTranslate(chat) {
		if ($('sb-ask')) {
			return;
		}
		const cats = catsLang();
		const box = document.createElement('div');
		box.id = 'sb-ask';
		/**
		 * The language options, with the picked one selected.
		 * @param {string} picked
		 */
		const options = (picked) =>
			Object.entries(LANGS).map(([code, name]) => html`<option value="${code}" ${code === picked && 'selected'}>${name}</option>`);
		setHtml(
			box,
			html`<div class="sb-crop-card sb-status-card">
			<b>🌐 Translate ${chatLabel(chat)}</b>
			<label class="sb-hint"><input type="checkbox" id="sb-tr-auto"> Translate their messages by themselves</label>
			<label class="sb-hint sb-tr-pick">Into <select id="sb-tr-to"><option value="">${cats ? `Same as CATS (${langName(cats)})` : `Automatic (${langName(autoLang())})`}</option>${options(opts.translateTo)}</select></label>
			<label class="sb-hint sb-tr-pick">I write in <select id="sb-tr-write"><option value="">My own words (no 🌐)</option>${options(opts.writeIn[chat] || '')}</select></label>
			<span class="sb-hint" style="text-align:center">Tap 🌐 under a message to translate just that one. Text you translate goes to Google Translate.</span>
			<div class="sb-crop-btns" style="justify-content:center"><button class="sb-pill" data-act="cancel">Cancel</button><button class="sb-go" data-act="save">Save</button></div>
		</div>`,
		);
		const auto = /** @type {HTMLInputElement} */ (box.querySelector('#sb-tr-auto'));
		const into = /** @type {HTMLSelectElement} */ (box.querySelector('#sb-tr-to'));
		const write = /** @type {HTMLSelectElement} */ (box.querySelector('#sb-tr-write'));
		auto.checked = opts.autoTranslate.includes(chat);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			const act = targetOf(e).dataset.act;
			if (targetOf(e) === box || act === 'cancel') {
				close();
			} else if (act === 'save') {
				setOpt('autoTranslate', [...opts.autoTranslate.filter((c) => c !== chat), ...(auto.checked ? [chat] : [])]);
				setOpt('translateTo', isLang(into.value) ? into.value : '');
				/** @type {Record<string, string>} */
				const writeIn = { ...opts.writeIn };
				if (isLang(write.value)) {
					writeIn[chat] = write.value;
				} else {
					delete writeIn[chat];
				}
				setOpt('writeIn', writeIn);
				close();
				render(true);
			}
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
	}

	/** Where YouTube songs play from (YouTube's privacy-enhanced embed). */
	const YT_ORIGIN = 'https://www.youtube-nocookie.com';
	/** Longest song title kept. */
	const TITLE_MAX = 100;
	/** The end of a sound file's name, and the name without it. */
	const SOUND_FILE = /^(.*)\.(?:mp3|ogg|opus|m4a|aac|flac|wav)$/i;
	/** Most songs in the queue. */
	const QUEUE_MAX = 50;
	/** Seconds a listener's YouTube song may drift from the host's (averaged) before it is moved. */
	const YT_DRIFT = 0.35;
	/** Seconds off at which any song is moved at once (the host jumped, or a player stalled). */
	const JUMP_DRIFT = 2;
	/** Ms a moved song is left to settle before it is measured again. */
	const SYNC_SETTLE = 3000;
	/** Ms between a host's reminders of where the song is, in group chats (g) and chats with a friend (n). */
	const SHARE_BEAT = { g: 30000, n: 60000 };
	/** Most songs one listener can have waiting in the host's queue. */
	const ADDS_MAX = 5;
	/** Most upcoming songs a host shows the listeners. */
	const UPCOMING_MAX = 10;
	/** Longest title of an upcoming song shown to the listeners. */
	const UPCOMING_TITLE = 40;
	/** How long a song shared in a chat stays offered without news from its host, in ms. */
	const JAM_MAX_AGE = 12 * 36e5;
	/**
	 * A song: a YouTube video, or a sound file (SOUND_FILE) on an https site.
	 * @typedef {object} Track
	 * @property {string} url the link (a YouTube link is rewritten to its watch address)
	 * @property {string} yt the YouTube video id; '' for a sound file
	 * @property {string} title the file's name or "YouTube" until the player tells the real title
	 * @property {number} [id] its number in the host's queue (listeners name it by this)
	 * @property {number} [by] who added it to the queue
	 */
	/**
	 * The song a link plays, if it is one.
	 * @param {string} link
	 * @returns {Track | null}
	 */
	const trackOf = (link) => {
		let url;
		try {
			url = new URL(link);
		} catch (e) {
			return null;
		}
		if (url.protocol !== 'https:') {
			return null;
		}
		const host = url.hostname.replace(/^(?:www|m|music)\./, '');
		let id = '';
		if (host === 'youtu.be') {
			id = url.pathname.slice(1);
		} else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
			id =
				url.pathname === '/watch'
					? url.searchParams.get('v') || ''
					: (/^\/(?:shorts|embed|live)\/([^/]+)/.exec(url.pathname) || ['', ''])[1];
		}
		if (/^[\w-]{11}$/.test(id)) {
			return { url: `https://www.youtube.com/watch?v=${id}`, yt: id, title: 'YouTube' };
		}
		const file = SOUND_FILE.exec(url.pathname.split('/').pop() || '');
		if (!file) {
			return null;
		}
		// A Dropbox share link opens Dropbox's page; raw=1 gives the file itself.
		if (host === 'dropbox.com') {
			url.searchParams.delete('dl');
			url.searchParams.set('raw', '1');
		}
		let title = file[1];
		try {
			title = decodeURIComponent(title);
		} catch (e) {
			/* keep it encoded */
		}
		return { url: url.href, yt: '', title: title.slice(0, TITLE_MAX) || 'Song' };
	};
	/**
	 * A song's state as its host shares it with a chat (short keys: it rides in a hidden beep).
	 * @typedef {object} MusicState
	 * @property {string} u the link
	 * @property {string} ti the title
	 * @property {number} p seconds into the song when sent
	 * @property {boolean} pl playing (false: paused)
	 * @property {number} d its length in seconds; 0 if not known
	 * @property {number} [i] its number in the host's queue
	 * @property {number} [b] who added it to the queue
	 */
	/**
	 * A song waiting in the host's queue, as the listeners see it.
	 * @typedef {object} QueueItem
	 * @property {number} id its number in the host's queue
	 * @property {string} ti its title
	 * @property {number} by who added it
	 */
	/**
	 * A song shared in a chat, as last heard from its host.
	 * @typedef {object} Jam
	 * @property {number} host the host's member number
	 * @property {string} hostName
	 * @property {MusicState} state
	 * @property {number} at Date.now() when `state` was true
	 */
	/** @type {Map<string, Jam>} Songs others share in your chats, by chat key ('n:<member number>' or 'g:<group id>'). */
	const jams = new Map();
	/** @type {Track[]} Your queue. */
	let queue = [];
	/** Index in `queue` of the song playing; -1 for none, and while listening along. */
	let queueAt = -1;
	/**
	 * The song loaded in the player.
	 * @typedef {object} Music
	 * @property {Track} track
	 * @property {string} author who made it, when YouTube says
	 * @property {boolean} playing
	 * @property {number} pos seconds into the song at `at`
	 * @property {number} at Date.now() when `pos` was read
	 * @property {number} dur its length in seconds; 0 until known
	 * @property {HTMLIFrameElement | HTMLAudioElement} el the player
	 * @property {boolean} ready the player takes commands
	 * @property {boolean} started it really started playing (until then its time stands still)
	 * @property {number} stall Date.now() when it stopped to load more; 0 while it plays
	 * @property {number} fixedAt Date.now() when a listener's player was last moved to the host's time
	 * @property {number} drift seconds ahead of the host (negative: behind), averaged
	 * @property {boolean} checkLead the next measurement tells how well the last move landed
	 */
	/** @type {Music | null} */
	let music = null;
	/** The chat you share your music with (you are its host); '' when you don't. */
	let sharing = '';
	/** The chat whose shared song you listen along to; '' when you don't. */
	let following = '';
	/** @type {Map<string, QueueItem[]>} The songs coming after the one shared in a chat, by chat key. */
	const jamQueues = new Map();
	/** @type {Map<string, number[]>} Who listens along to the song shared in a chat, by chat key. */
	const jamEars = new Map();
	/** Seconds a listener's YouTube song is moved past the host's time, for the time it takes to load there (learnt). */
	let seekLead = 0.3;
	/** Date.now() when you last told the chat you share with where the song is. */
	let sharedAt = 0;
	/** The number given to the last song added to your queue. */
	let trackIds = 0;
	/** Until when the seek bar is left alone because it is being dragged. */
	let seekingUntil = 0;
	/** The queue as last drawn, so it is only rebuilt when it changed. */
	let queueDrawn = '';

	/** Seconds into the song now. */
	const musicPos = () => {
		if (!music) {
			return 0;
		}
		const p = music.playing && music.started && !music.stall ? music.pos + (Date.now() - music.at) / 1000 : music.pos;
		return Math.max(0, music.dur ? Math.min(p, music.dur) : p);
	};
	/**
	 * Notes where the song is now.
	 * @param {number} pos
	 * @param {boolean} [playing]
	 */
	const setPos = (pos, playing) => {
		if (!music) {
			return;
		}
		music.pos = pos;
		music.at = Date.now();
		if (playing !== undefined) {
			music.playing = playing;
		}
	};
	/**
	 * Where a shared song is now.
	 * @param {Jam} j
	 */
	const jamPos = (j) => {
		const p = j.state.pl ? j.state.p + (Date.now() - j.at) / 1000 : j.state.p;
		return j.state.d ? Math.min(p, j.state.d) : p;
	};
	/**
	 * Who added a song, for the queue: "you", or their name.
	 * @param {string} chat the chat the song is shared in
	 * @param {number} n
	 */
	const adderName = (chat, n) => {
		if (n === Player.MemberNumber) {
			return 'you';
		}
		const g = chat.startsWith('g:') ? groups[chat.slice(2)] : undefined;
		const m = g && g.members.find((x) => x.n === n);
		return m ? m.name : nameOf(n);
	};
	/**
	 * Half the time a message takes to the group's relay and back, in ms (0 until measured).
	 * @param {string} gid
	 */
	const relayLag = (gid) => {
		const c = conns[gid];
		return c && c.rtt ? c.rtt / 2 : 0;
	};
	/**
	 * Whether a shared song is still worth offering: not over long ago, and heard from in the last 12 hours.
	 * @param {Jam | undefined} j
	 * @returns {j is Jam}
	 */
	const jamLive = (j) =>
		!!j && Date.now() - j.at < JAM_MAX_AGE && !(j.state.d && jamPos(j) >= j.state.d && !j.state.pl && Date.now() - j.at > 60000);
	/**
	 * A chat's name for the player.
	 * @param {string} chat a chat key
	 */
	const chatLabel = (chat) => {
		if (chat.startsWith('g:')) {
			const g = groups[chat.slice(2)];
			return g ? g.name : 'a group chat';
		}
		return nameOf(Number(chat.slice(2)));
	};
	/**
	 * Whether a chat can listen along: a group chat, or a friend who has SlimeBeep.
	 * @param {string} chat a chat key
	 */
	const canShare = (chat) => (chat.startsWith('g:') ? !!groups[chat.slice(2)] : peers.has(Number(chat.slice(2))));
	/**
	 * The chat open now as a chat key; '' on other pages.
	 * @returns {string}
	 */
	const openChatKey = () => {
		if (thread === null) {
			return '';
		}
		return typeof thread === 'string' ? thread : `n:${thread}`;
	};

	/**
	 * Sends a message to the YouTube player.
	 * @param {HTMLIFrameElement} f
	 * @param {object} message
	 */
	const toYouTube = (f, message) => {
		if (f.contentWindow) {
			f.contentWindow.postMessage(JSON.stringify({ ...message, id: 1, channel: 'widget' }), YT_ORIGIN);
		}
	};
	/**
	 * Sends a command to the YouTube player.
	 * @param {HTMLIFrameElement} f
	 * @param {string} func
	 * @param {unknown[]} [args]
	 */
	const ytCommand = (f, func, args = []) => toYouTube(f, { event: 'command', func, args });
	/**
	 * Takes what the YouTube player reports: time, length, state, title and channel.
	 * @param {MessageEvent} e
	 */
	function onYouTube(e) {
		const el = music && music.el;
		if (!music || !(el instanceof HTMLIFrameElement) || e.origin !== YT_ORIGIN || e.source !== el.contentWindow) {
			return;
		}
		/** @type {{ event?: string, info?: { duration?: unknown, currentTime?: unknown, playerState?: unknown, videoData?: { title?: unknown, author?: unknown } } }} */
		let d;
		try {
			d = JSON.parse(String(e.data));
		} catch (err) {
			return;
		}
		if (!d || typeof d !== 'object') {
			return;
		}
		if (d.event === 'onReady') {
			toYouTube(el, { event: 'listening' });
			playerReady();
			return;
		}
		const info = d.info;
		if (!info || typeof info !== 'object') {
			return;
		}
		playerReady();
		if (typeof info.duration === 'number' && info.duration > 0) {
			music.dur = info.duration;
		}
		const data = info.videoData;
		const title = data && typeof data.title === 'string' ? clean(data.title, TITLE_MAX) : '';
		if (title && title !== music.track.title) {
			music.track.title = title;
			shareState();
		}
		if (data && typeof data.author === 'string') {
			music.author = clean(data.author, LIMITS.name);
		}
		// 1: playing, 3: loading more. Before it first plays, its time is where it will start.
		if (info.playerState === 1 || info.playerState === 3) {
			playerRuns(info.playerState === 1);
		}
		if (typeof info.currentTime === 'number' && music.started) {
			setPos(info.currentTime);
		}
		// 0: the video ended.
		if (info.playerState === 0 && music.playing) {
			songEnded();
		}
		drawMusic();
	}

	/**
	 * Loads a song into the player and starts it (or leaves it paused).
	 * @param {Track} track
	 * @param {number} [pos] seconds into it
	 * @param {boolean} [playing]
	 */
	function loadSong(track, pos = 0, playing = true) {
		unloadSong();
		/** @type {HTMLIFrameElement | HTMLAudioElement} */
		let el;
		if (track.yt) {
			const f = document.createElement('iframe');
			f.allow = 'autoplay; encrypted-media';
			f.title = 'YouTube player';
			const q = `enablejsapi=1&controls=0&playsinline=1&autoplay=${playing ? 1 : 0}&mute=${opts.musicMuted ? 1 : 0}&start=${Math.floor(pos)}`;
			f.src = `${YT_ORIGIN}/embed/${track.yt}?${q}&origin=${encodeURIComponent(location.origin)}`;
			f.addEventListener('load', () => toYouTube(f, { event: 'listening' }));
			el = f;
		} else {
			const a = document.createElement('audio');
			a.preload = 'auto';
			a.src = track.url;
			a.addEventListener('loadedmetadata', () => {
				if (!music || music.el !== a) {
					return;
				}
				music.dur = isFinite(a.duration) ? a.duration : 0;
				music.ready = true;
				const j = following ? jams.get(following) : undefined;
				a.currentTime = j ? jamPos(j) : musicPos();
				if (music.playing) {
					a.play().catch(() => setPos(musicPos(), false));
				}
				drawMusic();
			});
			a.addEventListener('timeupdate', () => {
				if (music && music.el === a) {
					setPos(a.currentTime);
				}
			});
			a.addEventListener('playing', () => {
				if (music && music.el === a) {
					playerRuns(true);
				}
			});
			a.addEventListener('waiting', () => {
				if (music && music.el === a) {
					playerRuns(false);
				}
			});
			a.addEventListener('ended', () => {
				if (music && music.el === a) {
					songEnded();
				}
			});
			a.addEventListener('error', () => {
				if (music && music.el === a) {
					notify('⚠ That song could not be played');
					unloadSong();
					drawMusic();
				}
			});
			el = a;
		}
		music = {
			track,
			author: '',
			playing,
			pos,
			at: Date.now(),
			dur: 0,
			el,
			ready: false,
			started: false,
			stall: 0,
			fixedAt: 0,
			drift: 0,
			checkLead: false,
		};
		$('sb-mu-art').replaceChildren(el);
		applyVolume();
		openMusic(true);
	}
	/** Stops and removes the song in the player. */
	function unloadSong() {
		if (music) {
			if (music.el instanceof HTMLAudioElement) {
				music.el.pause();
			}
			music.el.remove();
		}
		music = null;
	}
	/** The YouTube player takes commands now: it gets the volume, and plays or pauses as `music` says. */
	function playerReady() {
		if (!music || music.ready) {
			return;
		}
		music.ready = true;
		applyVolume();
		applyMusic();
	}
	/**
	 * The player really plays (`runs`) or stopped to load more. Its time stands still while it loads. Once
	 * it starts, a listener's player moves to the host's time, and a host tells the chat where it really is.
	 * @param {boolean} runs
	 */
	function playerRuns(runs) {
		const m = music;
		if (!m) {
			return;
		}
		if (!runs) {
			if (m.started && !m.stall) {
				setPos(musicPos());
				m.stall = Date.now();
			}
			return;
		}
		if (m.started && !m.stall) {
			return;
		}
		const first = !m.started;
		const waited = m.stall ? Date.now() - m.stall : 0;
		m.started = true;
		m.stall = 0;
		// Its time runs again from now.
		setPos(m.pos);
		const j = following ? jams.get(following) : undefined;
		if (j && first && j.state.pl && Math.abs(musicPos() - jamPos(j)) > 0.15) {
			moveToHost(j);
		}
		if (first || waited > 500) {
			shareState();
		}
	}
	/**
	 * Makes the player match `music`: playing or paused, and the time. A sound file is moved when it is
	 * more than 2 s off; YouTube only when `seek` is set, since its time comes in late.
	 * @param {boolean} [seek]
	 */
	function applyMusic(seek = false) {
		const m = music;
		if (!m) {
			return;
		}
		const pos = musicPos();
		if (m.el instanceof HTMLAudioElement) {
			const a = m.el;
			if (a.readyState > 0 && (seek || Math.abs(a.currentTime - pos) > 2)) {
				a.currentTime = pos;
			}
			if (m.playing && a.paused && a.readyState > 0) {
				a.play().catch(() => setPos(musicPos(), false));
			} else if (!m.playing && !a.paused) {
				a.pause();
			}
			return;
		}
		// Until then the embed starts as it was loaded (start=, autoplay=).
		if (!m.ready) {
			return;
		}
		if (seek) {
			ytCommand(m.el, 'seekTo', [pos, true]);
		}
		ytCommand(m.el, m.playing ? 'playVideo' : 'pauseVideo');
	}
	/** Sets the player's volume and mute from opts. */
	function applyVolume() {
		const el = music && music.el;
		if (el instanceof HTMLAudioElement) {
			el.volume = opts.musicVolume / 100;
			el.muted = opts.musicMuted;
		} else if (el) {
			ytCommand(el, 'setVolume', [opts.musicVolume]);
			ytCommand(el, opts.musicMuted ? 'mute' : 'unMute');
		}
	}
	/** A song came to its end: the next one in your queue plays (a listener waits for the host). */
	function songEnded() {
		if (!music) {
			return;
		}
		setPos(music.dur || musicPos(), false);
		if (!following && queueAt >= 0 && queueAt < queue.length - 1) {
			playQueued(queueAt + 1);
			return;
		}
		shareState();
		drawMusic();
	}

	/**
	 * Puts a song at the end of your queue. A full queue makes room by dropping its first song, unless that one is playing.
	 * @param {Track} track
	 * @param {number} by who added it
	 * @returns {boolean} false when the queue is full
	 */
	function pushTrack(track, by) {
		if (queue.length >= QUEUE_MAX) {
			if (queueAt === 0) {
				return false;
			}
			queue = queue.slice(1);
			if (queueAt > 0) {
				queueAt -= 1;
			}
		}
		trackIds += 1;
		queue = [...queue, { ...track, id: trackIds, by }];
		return true;
	}
	/**
	 * Adds a song to your queue; it plays now when `now` is set or nothing is playing.
	 * @param {Track} track
	 * @param {boolean} now
	 */
	function addSong(track, now) {
		if (!pushTrack(track, Player.MemberNumber)) {
			notify('⚠ Your queue is full');
			return;
		}
		if (now || !music) {
			playQueued(queue.length - 1);
		} else {
			shareQueue();
			drawMusic();
		}
	}
	/**
	 * Plays song `i` of the queue.
	 * @param {number} i
	 */
	function playQueued(i) {
		if (!queue[i]) {
			return;
		}
		queueAt = i;
		loadSong(queue[i]);
		shareState();
		shareQueue();
		drawMusic();
	}
	/**
	 * Takes song `i` out of the queue (stopping it if it is the one playing).
	 * @param {number} i
	 */
	function removeQueued(i) {
		if (!queue[i]) {
			return;
		}
		queue = queue.filter((_, k) => k !== i);
		if (i === queueAt) {
			unloadSong();
			queueAt = -1;
			stopSharing();
		} else if (i < queueAt) {
			queueAt -= 1;
		}
		shareQueue();
		drawMusic();
	}

	/**
	 * The song's state as sent to the chat you share with.
	 * @returns {MusicState | null}
	 */
	const stateNow = () =>
		music && {
			u: music.track.url,
			ti: music.track.title,
			p: Math.round(musicPos() * 100) / 100,
			pl: music.playing,
			d: Math.round(music.dur),
			...(music.track.id ? { i: music.track.id } : {}),
			b: music.track.by || Player.MemberNumber,
		};
	/** Tells the chat you share with what is playing and where (after every change, and now and then). */
	function shareState() {
		const state = stateNow();
		if (!sharing || !state) {
			return;
		}
		sharedAt = Date.now();
		if (sharing.startsWith('g:')) {
			const gid = sharing.slice(2);
			// Where it will be when the relay passes it on.
			const p = state.pl ? Math.round((state.p + relayLag(gid) / 1000) * 100) / 100 : state.p;
			relaySend(gid, { t: 'music', ...state, p });
		} else {
			const chat = sharing;
			// Made when it goes out, since other hidden beeps may be waiting before it.
			sendHidden(Number(chat.slice(2)), () => {
				const now = sharing === chat ? stateNow() : null;
				return now && { sb: 1, music: now };
			});
		}
	}
	/** Tells the chat you share with which songs come next and who added them (titles only). */
	function shareQueue() {
		if (!sharing) {
			return;
		}
		/** @type {QueueItem[]} */
		const q = queue
			.slice(queueAt + 1, queueAt + 1 + UPCOMING_MAX)
			.map((t) => ({ id: t.id || 0, ti: t.title.slice(0, UPCOMING_TITLE), by: t.by || Player.MemberNumber }));
		if (sharing.startsWith('g:')) {
			relaySend(sharing.slice(2), { t: 'musicQueue', q });
			return;
		}
		const chat = sharing;
		sendHidden(Number(chat.slice(2)), () => {
			if (sharing !== chat) {
				return null;
			}
			// A hidden beep holds 1000 characters, keys included.
			while (q.length && JSON.stringify(q).length > 500) {
				q.pop();
			}
			return { sb: 1, mq: q };
		});
	}
	/** While you share a playing song, the chat is reminded now and then where it is (in case a message got lost). */
	function shareBeat() {
		const m = music;
		if (sharing && m && m.playing && m.started && !m.stall && Date.now() - sharedAt > SHARE_BEAT[sharing.startsWith('g:') ? 'g' : 'n']) {
			shareState();
		}
	}
	/**
	 * A listener asks you, the host, to queue a song: it goes at the end of your queue, and plays now if
	 * your music had come to its end.
	 * @param {string} chat where they listen along
	 * @param {number} by
	 * @param {unknown} u the link
	 * @param {unknown} ti its title
	 */
	function takeAdd(chat, by, u, ti) {
		const track = typeof u === 'string' && u.length <= 300 ? trackOf(u) : null;
		if (sharing !== chat || !track || by === Player.MemberNumber) {
			return;
		}
		if (queue.slice(queueAt + 1).filter((t) => t.by === by).length >= ADDS_MAX) {
			return;
		}
		const title = clean(ti, TITLE_MAX) || track.title;
		const ended = !music || (!music.playing && !!music.dur && musicPos() >= music.dur - 0.5);
		if (!pushTrack({ ...track, title }, by)) {
			return;
		}
		notify(`🎶 ${adderName(chat, by)} queued ${title}`);
		if (ended) {
			playQueued(queue.length - 1);
		} else {
			shareQueue();
			drawMusic();
		}
	}
	/**
	 * A listener skips the song they added (playing now or waiting); songs others added are left alone.
	 * @param {string} chat where they listen along
	 * @param {number} by
	 * @param {unknown} id the song's number
	 */
	function takeSkip(chat, by, id) {
		const i = queue.findIndex((t) => t.id === id);
		if (sharing !== chat || i < 0 || queue[i].by !== by || i < queueAt) {
			return;
		}
		notify(`⏭ ${adderName(chat, by)} skipped ${queue[i].title}`);
		if (i > queueAt) {
			removeQueued(i);
		} else if (queueAt < queue.length - 1) {
			playQueued(queueAt + 1);
		} else if (music) {
			setPos(music.dur || musicPos(), false);
			applyMusic(true);
			shareState();
			drawMusic();
		}
	}
	/**
	 * Starts sharing your music with a chat: everyone there gets a "Listen along" button. Nothing plays
	 * for them until they press it.
	 * @param {string} chat
	 */
	function startSharing(chat) {
		if (!music || !canShare(chat)) {
			return;
		}
		stopSharing();
		sharing = chat;
		shareState();
		shareQueue();
		notify(`🎧 Sharing your music with ${chatLabel(chat)}`);
		drawMusic();
		renderIfOpen(chat);
	}
	/** Stops sharing: the chat's "Listen along" goes away and its listeners stop. */
	function stopSharing() {
		const chat = sharing;
		if (!chat) {
			return;
		}
		sharing = '';
		jamEars.delete(chat);
		if (chat.startsWith('g:')) {
			relaySend(chat.slice(2), { t: 'musicEnd' });
		} else {
			sendHidden(Number(chat.slice(2)), { sb: 1, musicEnd: 1 });
		}
		drawMusic();
		renderIfOpen(chat);
	}
	/**
	 * Redraws the panel when a chat's page is the one open (its listen-along line changed).
	 * @param {string} chat
	 */
	function renderIfOpen(chat) {
		if (isOpen() && openChatKey() === chat) {
			render(true);
		}
	}

	/**
	 * News of a song shared in a chat (a SlimeBeep friend's hidden beep, or a group's relay): it is
	 * offered there with "Listen along", and followed if you listen along already. It never plays on its own.
	 * @param {string} chat a chat key
	 * @param {number} host who shares it
	 * @param {string} hostName
	 * @param {unknown} s a MusicState; null when they stopped sharing
	 * @param {number} [age] ms since it was sent: a group's song as stored when you connect
	 * @param {number} [travel] ms the news took to get here
	 */
	function takeJam(chat, host, hostName, s, age = 0, travel = 0) {
		const before = jams.get(chat);
		if (s === null) {
			if (before && before.host !== host) {
				return;
			}
			jams.delete(chat);
			jamQueues.delete(chat);
			jamEars.delete(chat);
			if (following === chat) {
				following = '';
				unloadSong();
				notify(`🎧 ${(before && before.hostName) || 'They'} stopped sharing music`);
				drawMusic();
			}
			renderIfOpen(chat);
			return;
		}
		const state = cleanState(s);
		if (!state) {
			return;
		}
		/** @type {Jam} */
		const j = {
			host,
			hostName: clean(hostName, LIMITS.name) || `#${host}`,
			state,
			at: Date.now() - (state.pl ? Math.max(0, age) + travel : 0),
		};
		jams.set(chat, j);
		if (before && before.host !== host) {
			jamQueues.delete(chat);
			jamEars.delete(chat);
		}
		// Someone else in a group started their own music: yours stops being the one shared there.
		if (sharing === chat) {
			sharing = '';
			notify(`🎧 ${j.hostName} is sharing music in ${chatLabel(chat)} now`);
		}
		if (following === chat) {
			followJam(j);
		} else if (!age && (!before || before.host !== host)) {
			card({
				icon: html`<span class="sb-av sb-gav">🎧</span>`,
				title: `🎧 ${j.hostName} is listening to music`,
				text: `${state.ti}${chat.startsWith('g:') ? ` · in ${chatLabel(chat)}` : ''}. Tap to listen along.`,
				onClick: () => listenAlong(chat),
			});
		}
		drawMusic();
		renderIfOpen(chat);
	}
	/**
	 * A MusicState from someone else, checked and cleaned; null if it isn't one.
	 * @param {unknown} s
	 * @returns {MusicState | null}
	 */
	function cleanState(s) {
		if (!s || typeof s !== 'object') {
			return null;
		}
		const x = /** @type {Partial<MusicState>} */ (s);
		const track = typeof x.u === 'string' && x.u.length <= 300 ? trackOf(x.u) : null;
		const p = typeof x.p === 'number' && isFinite(x.p) && x.p >= 0 && x.p <= 86400 ? x.p : -1;
		if (!track || p < 0 || typeof x.pl !== 'boolean') {
			return null;
		}
		const d = typeof x.d === 'number' && isFinite(x.d) && x.d > 0 && x.d <= 86400 ? x.d : 0;
		/** @type {MusicState} */
		const state = { u: track.url, ti: clean(x.ti, TITLE_MAX) || track.title, p, pl: x.pl, d };
		if (Number.isInteger(x.i) && /** @type {number} */ (x.i) > 0) {
			state.i = x.i;
		}
		if (isNum(x.b)) {
			state.b = x.b;
		}
		return state;
	}
	/**
	 * The songs coming after the one shared in a chat, from its host.
	 * @param {string} chat
	 * @param {number} host who sent them
	 * @param {unknown} list
	 */
	function takeQueue(chat, host, list) {
		const j = jams.get(chat);
		if (!Array.isArray(list) || (j && j.host !== host)) {
			return;
		}
		/** @type {QueueItem[]} */
		const q = [];
		for (const x of list.slice(0, UPCOMING_MAX)) {
			const y = /** @type {Partial<QueueItem> | null} */ (x);
			if (y && typeof y === 'object' && Number.isInteger(y.id) && isNum(y.by)) {
				q.push({ id: /** @type {number} */ (y.id), ti: clean(y.ti, UPCOMING_TITLE) || 'Song', by: /** @type {number} */ (y.by) });
			}
		}
		jamQueues.set(chat, q);
		drawMusic();
	}
	/**
	 * Asks the host you listen along with to queue a song (their SlimeBeep has to be new enough to show a queue).
	 * @param {Track} track
	 */
	function askHost(track) {
		const chat = following;
		const j = jams.get(chat);
		const q = jamQueues.get(chat);
		if (!j) {
			return;
		}
		if (!q) {
			notify(`⚠ ${j.hostName} needs to update SlimeBeep before you can add songs`);
			return;
		}
		if (q.filter((x) => x.by === Player.MemberNumber).length >= ADDS_MAX) {
			notify(`⚠ You have ${ADDS_MAX} songs waiting already`);
			return;
		}
		const song = { u: track.url, ti: track.title };
		if (chat.startsWith('g:')) {
			relaySend(chat.slice(2), { t: 'musicAdd', ...song });
		} else {
			sendHidden(j.host, { sb: 1, madd: song });
		}
		notify(`🎶 Asked ${j.hostName} to queue ${track.title}`);
	}
	/**
	 * Asks the host you listen along with to skip a song you added.
	 * @param {number} id the song's number
	 */
	function askSkip(id) {
		const chat = following;
		const j = jams.get(chat);
		if (!j) {
			return;
		}
		if (chat.startsWith('g:')) {
			relaySend(chat.slice(2), { t: 'musicSkip', id });
		} else {
			sendHidden(j.host, { sb: 1, mskip: id });
		}
	}
	/**
	 * Listens along to the song shared in a chat, with sound, from where the host is.
	 * @param {string} chat
	 */
	function listenAlong(chat) {
		const j = jams.get(chat);
		if (!jamLive(j)) {
			notify('🎧 That music has ended');
			return;
		}
		stopSharing();
		following = chat;
		queueAt = -1;
		unloadSong();
		followJam(j);
		tellListening(chat, true);
		unlock('js');
		renderIfOpen(chat);
	}
	/**
	 * Tells a chat's host (and, in a group, everyone) that you started or stopped listening along.
	 * @param {string} chat
	 * @param {boolean} on
	 */
	function tellListening(chat, on) {
		const j = jams.get(chat);
		if (chat.startsWith('g:')) {
			relaySend(chat.slice(2), { t: 'musicListen', on });
		} else if (j) {
			sendHidden(j.host, { sb: 1, mlisten: on ? 1 : 0 });
		}
	}
	/**
	 * Who listens along in a chat changed (a group's list from the relay, or your friend in a chat with them).
	 * Its host gets a note for each newcomer.
	 * @param {string} chat
	 * @param {unknown} list member numbers
	 */
	function takeEars(chat, list) {
		if (!Array.isArray(list)) {
			return;
		}
		const before = jamEars.get(chat) || [];
		const ears = list.filter((n) => isNum(n) && n !== Player.MemberNumber).slice(0, LIMITS.members);
		jamEars.set(chat, ears);
		if (sharing === chat) {
			for (const n of ears.filter((x) => !before.includes(x))) {
				notify(`🎧 ${adderName(chat, n)} is listening along`);
			}
			if (ears.length >= 3) {
				unlock('dj');
			}
		}
		drawMusic();
	}
	/**
	 * Makes the player follow the host: their song, playing or paused, at their time.
	 * @param {Jam} j
	 */
	function followJam(j) {
		const track = trackOf(j.state.u);
		if (!track) {
			return;
		}
		const pos = jamPos(j);
		if (j.state.pl && j.state.b === Player.MemberNumber) {
			unlock('rl');
		}
		if (!music || music.track.url !== track.url || music.track.id !== j.state.i) {
			loadSong({ ...track, title: j.state.ti, id: j.state.i, by: j.state.b }, pos, j.state.pl);
			if (music) {
				music.dur = j.state.d;
			}
		} else {
			music.track.title = j.state.ti;
			// The host paused, played or jumped; smaller gaps are keepInTime's.
			if (music.playing !== j.state.pl || Math.abs(musicPos() - pos) > JUMP_DRIFT) {
				moveToHost(j);
			}
		}
		drawMusic();
	}
	/**
	 * Moves a listener's player to the host's time: a playing YouTube song a little further, for the time it takes to load there.
	 * @param {Jam} j
	 */
	function moveToHost(j) {
		const m = music;
		if (!m) {
			return;
		}
		const lead = j.state.pl && !(m.el instanceof HTMLAudioElement);
		setPos(jamPos(j) + (lead ? seekLead : 0), j.state.pl);
		applyMusic(true);
		m.fixedAt = Date.now();
		m.drift = 0;
		m.checkLead = lead;
	}
	/** Stops listening along. */
	function leaveJam() {
		const chat = following;
		if (!chat) {
			return;
		}
		following = '';
		unloadSong();
		tellListening(chat, false);
		notify(`🎧 You stopped listening along with ${(jams.get(chat) || { hostName: chatLabel(chat) }).hostName}`);
		drawMusic();
		renderIfOpen(chat);
	}
	/** Every second while listening along: keeps the player at the host's time. */
	function keepInTime() {
		const j = following ? jams.get(following) : undefined;
		const m = music;
		if (!j || !m || !m.playing || !m.started || m.stall || Date.now() - m.fixedAt < SYNC_SETTLE) {
			return;
		}
		const off = musicPos() - jamPos(j);
		if (Math.abs(off) > JUMP_DRIFT) {
			moveToHost(j);
			return;
		}
		if (m.el instanceof HTMLAudioElement) {
			// A sound file closes small gaps by playing a little faster or slower: there is no jump to hear.
			m.el.playbackRate = Math.abs(off) < 0.05 ? 1 : fit(1 - off / 10, 0.95, 1.05);
			return;
		}
		if (m.checkLead) {
			// Where the last move landed tells how far past the host's time to aim next time.
			m.checkLead = false;
			seekLead = fit(seekLead - off, 0, 2);
		}
		m.drift = m.drift * 0.5 + off * 0.5;
		if (Math.abs(m.drift) > YT_DRIFT) {
			moveToHost(j);
		}
	}

	/**
	 * The listen-along line at the top of a chat: what is shared there and the button for it.
	 * @param {string} chat
	 * @returns {HtmlValue}
	 */
	function jamLine(chat) {
		if (sharing === chat && music) {
			return html`<div class="sb-jamline">🎧 You're sharing <b>${music.track.title}</b><button class="sb-pill" data-jam="stop">Stop sharing</button></div>`;
		}
		const j = jams.get(chat);
		if (following === chat && j) {
			return html`<div class="sb-jamline on">🎧 Listening along with ${j.hostName}: <b>${j.state.ti}</b><button class="sb-pill" data-jam="leave">Leave</button></div>`;
		}
		if (jamLive(j)) {
			return html`<div class="sb-jamline">🎧 ${j.hostName} is listening to <b>${j.state.ti}</b><button class="sb-pill sb-go" data-jam="join">Listen along</button></div>`;
		}
		return '';
	}
	/**
	 * Wires the listen-along line of the chat just drawn.
	 * @param {string} chat
	 */
	function wireJamLine(chat) {
		for (const b of $$($('sb-view'), '[data-jam]')) {
			b.addEventListener('click', () => {
				const act = b.dataset.jam;
				if (act === 'join') {
					listenAlong(chat);
				} else if (act === 'leave') {
					leaveJam();
				} else {
					stopSharing();
				}
			});
		}
	}

	/**
	 * Shows or hides the music player.
	 * @param {boolean} on
	 */
	function openMusic(on) {
		const box = $('sb-mu');
		if (!box) {
			return;
		}
		box.classList.toggle('on', on);
		if (on) {
			placeMusic();
			drawMusic();
		}
	}
	/** Puts the music player where it was left (by default bottom left), inside the window. */
	function placeMusic() {
		const box = $('sb-mu');
		const w = box.offsetWidth || 300;
		const h = box.offsetHeight || 200;
		const p = opts.musicPos || { x: 16, y: innerHeight - h - 16 };
		box.style.left = `${fit(p.x, 8, Math.max(8, innerWidth - w - 8))}px`;
		box.style.top = `${fit(p.y, 8, Math.max(8, innerHeight - h - 8))}px`;
	}
	/** Redraws the music player from `music`, the queue and what is shared. */
	function drawMusic() {
		const box = $('sb-mu');
		if (!box) {
			return;
		}
		const m = music;
		const j = following ? jams.get(following) : undefined;
		/** @param {number} s seconds */
		const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
		box.classList.toggle('yt', !!m && !!m.track.yt);
		box.classList.toggle('following', !!following);
		// With the player hidden, 🎵 shows that music is still playing.
		const btn = $('sb-music');
		if (btn) {
			btn.classList.toggle('playing', !!m && m.playing);
			btn.title = m && m.playing ? `Music player (playing ${m.track.title})` : 'Music player';
		}
		$('sb-mu-title').textContent = m ? m.track.title : 'Nothing playing';
		$('sb-mu-title').title = m ? m.track.title : '';
		let status = 'Paste a YouTube or mp3 link below';
		if (j) {
			status = `🎧 Listening along with ${j.hostName}`;
		} else if (sharing) {
			status = `🎧 Sharing with ${chatLabel(sharing)}`;
		} else if (m) {
			status = m.author || 'Only you';
		}
		$('sb-mu-status').textContent = status;
		drawEars();
		const pos = musicPos();
		$('sb-mu-cur').textContent = clock(pos);
		$('sb-mu-dur').textContent = m && m.dur ? clock(m.dur) : '0:00';
		const seek = $input('sb-mu-seek');
		seek.max = String(m ? Math.round(m.dur) : 0);
		seek.disabled = !m || !m.dur || !!following;
		if (Date.now() > seekingUntil) {
			seek.value = String(Math.round(pos));
		}
		const play = $input('sb-mu-play');
		setHtml(play, m && m.playing ? ICONS.pause : ICONS.play);
		play.title = m && m.playing ? 'Pause' : 'Play';
		play.disabled = !!following || (!m && !queue.length);
		$input('sb-mu-prev').disabled = !!following || !m;
		const next = $input('sb-mu-next');
		// A listener skips only a song they added.
		next.disabled = j ? j.state.b !== Player.MemberNumber || !j.state.i : queueAt < 0 || queueAt >= queue.length - 1;
		next.title = j ? 'Skip your song' : 'Next song';
		const mute = $('sb-mu-mute');
		mute.textContent = opts.musicMuted || !opts.musicVolume ? '🔇' : '🔊';
		mute.title = opts.musicMuted ? 'Turn the sound on' : 'Mute';
		$input('sb-mu-vol').value = String(opts.musicVolume);
		// The share button: for the chat open in SlimeBeep.
		const chat = openChatKey();
		const share = $input('sb-mu-share');
		share.classList.toggle('on', !!sharing || !!following);
		share.disabled = false;
		if (following) {
			share.textContent = `🚪 Stop listening along with ${j ? j.hostName : chatLabel(following)}`;
		} else if (sharing) {
			share.textContent = `⏹ Stop sharing with ${chatLabel(sharing)}`;
		} else if (chat && canShare(chat)) {
			share.textContent = `🎧 Share with ${chatLabel(chat)}`;
			share.disabled = !m;
		} else {
			share.textContent = chat ? `🎧 ${chatLabel(chat)} doesn't have SlimeBeep` : '🎧 Open a chat to share with it';
			share.disabled = true;
		}
		const jq = following ? jamQueues.get(following) || [] : [];
		const drawn = JSON.stringify(j ? [following, j.state.i, j.state.ti, j.state.b, jq] : [queue.map((t) => [t.title, t.by]), queueAt]);
		if (drawn !== queueDrawn) {
			queueDrawn = drawn;
			const me = Player.MemberNumber;
			/** @param {number | undefined} by */
			const byLine = (by) => (by && by !== me ? html`<span class="sb-mu-by">${adderName(following || sharing, by)}</span>` : '');
			setHtml(
				$('sb-mu-queue'),
				j
					? html`${[{ id: j.state.i || 0, ti: j.state.ti, by: j.state.b || j.host }, ...jq].map(
							(t, i) =>
								html`<div class="sb-mu-row${i ? '' : ' on'}"><span class="sb-mu-song" title="${t.ti}">${i ? '' : '▶ '}${t.ti}</span>${byLine(t.by)}${t.by === me && t.id ? html`<button class="sb-mu-del" data-jskip="${t.id}" title="Skip your song">${ICONS.close}</button>` : ''}</div>`,
						)}`
					: html`${queue.map(
							(t, i) =>
								html`<div class="sb-mu-row${i === queueAt ? ' on' : ''}"><button class="sb-mu-song" data-q="${i}" title="${t.url}">${i === queueAt ? '▶ ' : ''}${t.title}</button>${byLine(t.by)}<button class="sb-mu-del" data-qdel="${i}" title="Remove">${ICONS.close}</button></div>`,
						)}`,
			);
			// A longer queue makes the player taller: it stays inside the window.
			placeMusic();
		}
	}
	/** Small pictures of who listens along to the song you share or follow. */
	function drawEars() {
		const chat = sharing || following;
		const j = following ? jams.get(following) : undefined;
		// In a chat with a friend, they only listen while online.
		const ears = (jamEars.get(chat) || []).filter((n) => chat.startsWith('g:') || friends.some((f) => f.MemberNumber === n));
		const list = j ? [j.host, ...ears.filter((n) => n !== j.host)] : ears;
		const drawn = JSON.stringify([chat, list, list.map((n) => !!pfpOf(n))]);
		const box = $('sb-mu-ears');
		if (box.dataset.drawn === drawn) {
			return;
		}
		box.dataset.drawn = drawn;
		const names = list.map((n) => (j && n === j.host ? j.hostName : adderName(chat, n)));
		box.title = list.length ? `Listening: ${names.join(', ')}` : '';
		setHtml(box, html`${list.map((n, i) => html`<span title="${names[i]}">${avatar(n, names[i])}</span>`)}`);
	}
	/** Builds the music player (hidden until 🎵 or a song opens it). */
	function buildMusic() {
		const box = document.createElement('div');
		box.id = 'sb-mu';
		setHtml(
			box,
			html`
			<div class="sb-head" id="sb-mu-head"><b>🎵 SlimeBeep Music</b>
				<button id="sb-mu-mini" title="Smaller">${ICONS.down}</button><button id="sb-mu-x" title="Hide (the music keeps playing)">${ICONS.close}</button></div>
			<div class="sb-mu-now">
				<div class="sb-mu-art" id="sb-mu-art"></div>
				<div class="sb-mu-info"><div class="sb-mu-title" id="sb-mu-title"></div><div class="sb-mu-status" id="sb-mu-status"></div><div class="sb-mu-ears" id="sb-mu-ears"></div></div>
			</div>
			<div class="sb-mu-progress"><span id="sb-mu-cur">0:00</span><input type="range" id="sb-mu-seek" min="0" max="0" step="1" value="0" aria-label="Song position"><span id="sb-mu-dur">0:00</span></div>
			<div class="sb-mu-controls">
				<button id="sb-mu-prev" title="Back to the start (twice: the song before)">${ICONS.prev}</button>
				<button id="sb-mu-play" class="sb-mu-big"></button>
				<button id="sb-mu-next" title="Next song">${ICONS.next}</button>
				<span class="sb-mu-vol"><button id="sb-mu-mute"></button><input type="range" id="sb-mu-vol" min="0" max="100" step="1" aria-label="Volume"></span>
			</div>
			<div class="sb-mu-more">
				<div class="sb-mu-add"><input class="sb-search" id="sb-mu-link" placeholder="Paste a YouTube or mp3 link…" aria-label="Song link"><button id="sb-mu-addbtn" title="Add to the queue">＋</button></div>
				<div class="sb-mu-queue" id="sb-mu-queue"></div>
				<button class="sb-pill sb-mu-share" id="sb-mu-share"></button>
			</div>`,
		);
		document.body.appendChild(box);
		wireMusic(box);
		addEventListener('message', onYouTube);
	}
	/**
	 * Wires the music player's buttons, sliders, link box and dragging.
	 * @param {HTMLElement} box
	 */
	function wireMusic(box) {
		$('sb-mu-play').addEventListener('click', () => {
			if (!music) {
				playQueued(queueAt >= 0 ? queueAt : 0);
				return;
			}
			// Play at the end starts the song again.
			setPos(music.dur && musicPos() >= music.dur - 0.5 ? 0 : musicPos(), !music.playing);
			applyMusic(true);
			shareState();
			drawMusic();
		});
		$('sb-mu-prev').addEventListener('click', () => {
			if (musicPos() > 3 || queueAt <= 0) {
				setPos(0);
				applyMusic(true);
				shareState();
				drawMusic();
			} else {
				playQueued(queueAt - 1);
			}
		});
		$('sb-mu-next').addEventListener('click', () => {
			const j = following ? jams.get(following) : undefined;
			if (!j) {
				playQueued(queueAt + 1);
			} else if (j.state.i) {
				askSkip(j.state.i);
			}
		});
		const seek = $input('sb-mu-seek');
		seek.addEventListener('input', () => {
			seekingUntil = Date.now() + 1500;
		});
		seek.addEventListener('change', () => {
			seekingUntil = 0;
			setPos(Number(seek.value));
			applyMusic(true);
			shareState();
			drawMusic();
		});
		$('sb-mu-mute').addEventListener('click', () => {
			setOpt('musicMuted', !opts.musicMuted);
			applyVolume();
			drawMusic();
		});
		const vol = $input('sb-mu-vol');
		vol.addEventListener('input', () => {
			setOpt('musicVolume', Number(vol.value));
			setOpt('musicMuted', false);
			applyVolume();
			drawMusic();
		});
		const link = $input('sb-mu-link');
		const add = () => {
			const track = trackOf(link.value.trim());
			if (!track) {
				notify('⚠ Paste a YouTube link, or a link to a sound file (mp3, ogg, m4a, flac, wav…)');
				return;
			}
			link.value = '';
			if (following) {
				askHost(track);
			} else {
				addSong(track, false);
			}
		};
		$('sb-mu-addbtn').addEventListener('click', add);
		link.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				add();
			}
		});
		$('sb-mu-queue').addEventListener('click', (e) => {
			const b = /** @type {HTMLElement | null} */ (targetOf(e).closest('button'));
			if (!b) {
				return;
			}
			if (b.dataset.jskip !== undefined) {
				askSkip(Number(b.dataset.jskip));
			} else if (b.dataset.qdel !== undefined) {
				removeQueued(Number(b.dataset.qdel));
			} else if (b.dataset.q !== undefined) {
				playQueued(Number(b.dataset.q));
			}
		});
		$('sb-mu-share').addEventListener('click', () => {
			if (following) {
				leaveJam();
			} else if (sharing) {
				stopSharing();
			} else {
				startSharing(openChatKey());
			}
		});
		$('sb-mu-mini').addEventListener('click', () => {
			box.classList.toggle('mini');
			placeMusic();
		});
		$('sb-mu-x').addEventListener('click', () => openMusic(false));
		const head = $('sb-mu-head');
		/** @type {{ dx: number, dy: number } | null} */
		let drag = null;
		head.addEventListener('pointerdown', (e) => {
			if (e.button !== 0 || targetOf(e).closest('button')) {
				return;
			}
			const r = box.getBoundingClientRect();
			drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
			try {
				head.setPointerCapture(e.pointerId);
			} catch (err) {
				/* works without capture */
			}
		});
		head.addEventListener('pointermove', (e) => {
			if (!drag) {
				return;
			}
			if (!(e.buttons & 1)) {
				drag = null;
				return;
			}
			setOpt('musicPos', { x: e.clientX - drag.dx, y: e.clientY - drag.dy });
			placeMusic();
		});
		const end = () => {
			drag = null;
		};
		head.addEventListener('pointerup', end);
		head.addEventListener('lostpointercapture', end);
	}
	/**
	 * ▶ on a song link in a chat: it plays now, for you only (sharing goes through the player's share button).
	 * While you listen along, it goes to the host's queue instead.
	 * @param {string} link
	 */
	function playLink(link) {
		const track = trackOf(link);
		if (!track) {
			return;
		}
		if (following) {
			askHost(track);
		} else {
			addSong(track, true);
		}
	}

	/** Emoji picker tabs: tab icon -> space-separated emoji. */
	const EMOJI = {
		'😊': '😀 😁 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😛 😜 🤪 😏 😌 😴 🥺 😳 😱 😭 😢 😤 😡 🤬 🙄 😬 🤔 🤭 🤫 😶 😈 👿 🤤 🥵 🥴 😵 🤯 🥳 😎 🤓 🫠 🫣 🫢',
		'❤️': '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💖 💗 💓 💕 💞 💘 💝 💔 ❣️ 💋 💌 💐 🌹 🌸 💍 🔥 ✨ 💫 ⭐ 🌟',
		'👋': '👋 🤚 ✋ 🖐️ 👌 🤌 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🙏 💪 🫦 👀 👅 💅 🤗',
		'🐱': '🐱 😺 😸 😻 😼 🙀 🐶 🐰 🐇 🦊 🐺 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🦋 🐝 🐞 🐙 🦄 🐉 🐍 🦇',
		'🎀': '🎀 🎁 🎉 🎈 🎂 🍰 🧁 🍭 🍬 🍫 🍓 🍒 🍑 🍆 🍌 🍷 🍸 🍹 🧋 ☕ 🍵 🍕 🍔 🍟 🌮 🍣 🍜 🔗 ⛓️ 🔒 🔑 🗝️ 🪢 🧸 👑 💎 🕯️ 🎶 🎮',
	};
	/** opts.recentEmoji, validated. */
	const loadRecent = () =>
		Array.isArray(opts.recentEmoji) ? opts.recentEmoji.filter((e) => typeof e === 'string' && e.length <= 16).slice(0, 24) : [];
	/** @type {string | null} Open emoji tab; null opens 🕘 when there are recent ones. */
	let emojiTab = null;
	/** Closes the emoji picker. */
	function closeEmoji() {
		const el = $('sb-emoji');
		if (el) {
			el.remove();
		}
	}
	/** Opens or closes the emoji picker. */
	function toggleEmoji() {
		if ($('sb-emoji')) {
			return closeEmoji();
		}
		const box = document.createElement('div');
		box.id = 'sb-emoji';
		emojiTab = null; // opens on 🕘 when there are any
		$('sb-panel').appendChild(box);
		drawEmoji();
	}
	/** Draws the picker; a click inserts the emoji at the cursor. */
	function drawEmoji() {
		const box = $('sb-emoji');
		if (!box) {
			return;
		}
		const recentEmoji = loadRecent();
		const tabs = [...(recentEmoji.length ? ['🕘'] : []), ...Object.keys(EMOJI)];
		const open = emojiTab !== null && tabs.includes(emojiTab) ? emojiTab : tabs[0];
		emojiTab = open;
		const list = open === '🕘' ? recentEmoji : EMOJI[/** @type {keyof typeof EMOJI} */ (open)].split(' ');
		setHtml(
			box,
			html`<div class="sb-emo-tabs">${tabs.map((t) => html`<button data-etab="${t}" class="${t === emojiTab && 'on'}">${t}</button>`)}<button data-eclose="1" title="Close">${ICONS.close}</button></div>
			<div class="sb-emo-grid">${list.map((e) => html`<button data-emo="${e}">${e}</button>`)}</div>`,
		);
		box.onclick = (ev) => {
			const b = targetOf(ev).closest('button');
			if (!b) {
				return;
			}
			if (b.dataset.eclose) {
				return closeEmoji();
			}
			if (b.dataset.etab) {
				emojiTab = b.dataset.etab;
				return drawEmoji();
			}
			const e = b.dataset.emo;
			const ta = $input('sb-text');
			if (!e || !ta) {
				return;
			}
			const at = ta.selectionStart ?? ta.value.length,
				end = ta.selectionEnd ?? at;
			if (ta.value.length + e.length > Number(ta.maxLength || 1000)) {
				return;
			}
			ta.value = ta.value.slice(0, at) + e + ta.value.slice(end);
			ta.selectionStart = ta.selectionEnd = at + e.length;
			ta.focus();
			setOpt('recentEmoji', [e, ...recentEmoji.filter((x) => x !== e)].slice(0, 24));
		};
	}

	/** Chat commands for /help: [usage, description]. */
	const COMMANDS = [
		['/me <action>', 'Does an action: /me waves sends *waves*'],
		['/shrug [text]', 'Adds ¯\\_(ツ)_/¯'],
		['/roll [sides]', 'Rolls a die (6 sides unless you say): *rolls a d20: 13*'],
		['/flip', 'Flips a coin'],
		['/help', 'This list'],
		['//text', 'Sends a message that starts with /'],
	];
	/**
	 * Applies a chat command to typed text.
	 * @param {string} raw
	 * @returns {?string} the text to send, or null for nothing (/help, or an unknown command)
	 */
	function command(raw) {
		const text = String(raw || '').trim();
		if (!text.startsWith('/')) {
			return raw;
		}
		if (text.startsWith('//')) {
			return text.slice(1);
		}
		const m = /^\/(\w+)\s*([\s\S]*)$/.exec(text);
		const name = m ? m[1].toLowerCase() : '',
			rest = m ? m[2].trim() : '';
		switch (name) {
			case 'me':
			case 'action':
			case 'emote':
				if (!rest) {
					notify('/me what? Like: /me waves');
					return null;
				}
				return `*${rest.replace(/^\*+|\*+$/g, '')}*`;
			case 'shrug':
				return `${rest ? `${rest} ` : ''}¯\\_(ツ)_/¯`;
			case 'roll':
			case 'dice': {
				const sides = Math.max(2, Math.min(1000, parseInt(rest, 10) || 6));
				const n = 1 + Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * sides);
				return `*rolls a d${sides}: ${n}* 🎲`;
			}
			case 'flip':
			case 'coin':
				return `*flips a coin: ${crypto.getRandomValues(new Uint8Array(1))[0] & 1 ? 'heads' : 'tails'}* 🪙`;
			case 'help':
			case 'commands':
				showHelp();
				return null;
			default:
				notify(`Unknown command /${name || '?'}: try /help`);
				return null;
		}
	}
	/** Shows the /help box in the panel. */
	function showHelp() {
		if ($('sb-ask')) {
			return;
		}
		const box = document.createElement('div');
		box.id = 'sb-ask';
		setHtml(
			box,
			html`<div class="sb-crop-card" style="align-items:stretch">
			<b style="text-align:center">💬 Chat commands</b>
			${COMMANDS.map(([c, d]) => html`<div class="sb-cmd"><code>${c}</code><span>${d}</span></div>`)}
			<span class="sb-hint" style="text-align:center">😊 opens the emoji. *giggles* shows as an action.</span>
			<div class="sb-crop-btns" style="justify-content:center"><button class="sb-go" data-act="keep">Got it</button></div>
		</div>`,
		);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
			if ($('sb-text')) {
				$('sb-text').focus();
			}
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			if (targetOf(e) === box || targetOf(e).dataset.act === 'keep') {
				close();
			}
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
	}

	/** Last pointerdown on the panel or toggle. */
	let lastPanelTouch = 0;
	/** Whether the player's last click was in the window (so Esc closes it even when nothing in it has focus). */
	let panelActive = false;
	/** @param {PointerEvent} e */
	function leavePanel(e) {
		if (!(e.target instanceof Node) || !$('sb-panel').contains(e.target)) {
			panelActive = false;
		}
	}
	/**
	 * Esc after clicking somewhere in the window that takes no focus (a bubble, the header): the key goes to
	 * the page, not the window, so it is caught here. Keys typed in the window never get here.
	 * @param {KeyboardEvent} e
	 */
	function escAfterClick(e) {
		if (e.key !== 'Escape' || !panelActive || !isOpen() || (e.target !== document.body && e.target !== document.documentElement)) {
			return;
		}
		if ($('sb-emoji')) {
			closeEmoji();
		} else {
			setOpen(false);
		}
	}
	/**
	 * Whether a redraw may focus SlimeBeep's chat box: only if focus is already in the panel or it was
	 * touched in the last 1.5 s, so it never takes the cursor from the game's chat input.
	 */
	function wantsFocus() {
		const a = document.activeElement,
			panel = $('sb-panel');
		if (a && a !== document.body && panel && panel.contains(a)) {
			return true;
		}
		if (a && a !== document.body) {
			return false;
		} // focus is elsewhere, e.g. the game's chat
		return Date.now() - lastPanelTouch < 1500;
	}

	/** @type {ReturnType<typeof setTimeout> | undefined} Hides the toast. */
	let toastTimer;
	/** @type {number[]} When the slime was last clicked (for the crown). */
	const slimeClicks = [];
	/** Ten clicks on the slime within four seconds crown it. */
	function countCrownClick() {
		const now = Date.now();
		slimeClicks.push(now);
		while (slimeClicks.length && now - slimeClicks[0] > 4000) {
			slimeClicks.shift();
		}
		if (slimeClicks.length >= 10) {
			slimeClicks.length = 0;
			crown();
		}
	}
	/** The slime gets a royal crown (for this visit), with a tada and confetti. */
	function crown() {
		const s = $('sb-toggle');
		s.classList.add('sb-crowned');
		if (!opts.dnd) {
			fanfare(TADA);
		}
		if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
			confetti(s.getBoundingClientRect());
		}
		const text = 'All hail the Slime Queen!';
		if (gameToasts()) {
			gameToast({ title: '👑 SlimeBeep', text, ms: 6000, category: 'SlimeBeep-crown' });
		} else {
			notify(`👑 ${text}`);
		}
	}
	/** @type {[number, number, number][]} A little fanfare for the crown: C E G, then a high C (Hz, start s, length s). */
	const TADA = [
		[523, 0, 0.12],
		[659, 0.1, 0.12],
		[784, 0.2, 0.12],
		[1047, 0.32, 0.5],
	];
	/** @type {[number, number, number][]} The achievement chime: G, then a high D. */
	const CHIME = [
		[784, 0, 0.1],
		[1175, 0.09, 0.35],
	];
	/**
	 * Plays notes on a soft triangle wave.
	 * @param {[number, number, number][]} notes Hz, start and length in seconds
	 */
	function fanfare(notes) {
		try {
			const ac = audioCtx || (audioCtx = new AudioContext());
			for (const [f, at, len] of notes) {
				const o = ac.createOscillator(),
					g = ac.createGain();
				o.type = 'triangle';
				o.frequency.value = f;
				g.gain.setValueAtTime(0.0001, ac.currentTime + at);
				g.gain.exponentialRampToValueAtTime(0.14, ac.currentTime + at + 0.02);
				g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + len);
				o.connect(g).connect(ac.destination);
				o.start(ac.currentTime + at);
				o.stop(ac.currentTime + at + len + 0.02);
			}
		} catch (e) {
			/* no sound, no matter */
		}
	}
	/**
	 * A burst of confetti from the middle of a box (removed when it has fallen).
	 * @param {DOMRect} r
	 */
	function confetti(r) {
		const box = document.createElement('div');
		box.className = 'sb-confetti';
		box.style.left = `${r.left + r.width / 2}px`;
		box.style.top = `${r.top + r.height / 2}px`;
		const colours = ['#ff4fa3', '#ffd23f', '#7bdcff', '#9b6bff', '#6fe3a1', '#ff8a5c'];
		for (let i = 0; i < 40; i++) {
			const bit = document.createElement('i');
			const angle = Math.random() * Math.PI * 2;
			const dist = 60 + Math.random() * 110;
			bit.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
			bit.style.setProperty('--dy', `${Math.sin(angle) * dist - 40}px`);
			bit.style.setProperty('--r', `${Math.round(Math.random() * 720 - 360)}deg`);
			bit.style.background = colours[i % colours.length];
			bit.style.animationDelay = `${Math.random() * 0.12}s`;
			box.appendChild(bit);
		}
		document.body.appendChild(box);
		setTimeout(() => box.remove(), 1700);
	}
	/** Makes the slime bounce. */
	function boing() {
		const s = $('sb-toggle');
		s.classList.remove('boing');
		void s.offsetWidth;
		s.classList.add('boing');
	}
	/**
	 * Shows a short note: a game toast, or the bubble by the toggle on games without toasts.
	 * @param {string} text
	 */
	function notify(text) {
		if (gameToasts()) {
			if (typeof ToastManager.dismissByCategory === 'function') {
				ToastManager.dismissByCategory('SlimeBeep-note');
			}
			gameToast({ text, ms: 2200, category: 'SlimeBeep-note' });
			boing();
			return;
		}
		const t = $('sb-toast'),
			s = $('sb-toggle');
		t.textContent = text;
		const r = isOpen() ? $('sb-panel').getBoundingClientRect() : s.getBoundingClientRect();
		t.classList.add('show');
		t.style.left = `${Math.max(8, Math.min(innerWidth - t.offsetWidth - 8, r.left + r.width / 2 - t.offsetWidth / 2))}px`;
		t.style.top = `${r.bottom + 8 + t.offsetHeight <= innerHeight ? r.bottom + 8 : Math.max(8, r.top - t.offsetHeight - 8)}px`;
		boing();
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
	}

	/**
	 * Sends a beep with the game's own ServerSendBeepMessage (its format, limits and beep log).
	 * @param {number} n
	 * @param {string} text
	 * @param {boolean} includeRoom adds your room
	 */
	function beep(n, text, includeRoom) {
		try {
			if (typeof ServerSendBeepMessage === 'function') {
				ServerSendBeepMessage(n, text, { includeRoom });
			} else if (typeof ServerSend === 'function') {
				ServerSend('AccountBeep', { MemberNumber: n, BeepType: '', IsSecret: !includeRoom, Message: text });
			} else {
				throw new Error('the game has no beep sender any more');
			}
		} catch (e) {
			warn(e, 'beep');
			notify('⚠ That beep could not be sent');
		}
	}

	/** @type {number[] | undefined} Friends ticked on the WaveBeep tab since it was opened. */
	let waveTicked;
	/** The WaveBeep text being written. */
	let waveText = '';
	/** @type {boolean | undefined} The WaveBeep 📍 box (undefined: opts.shareRoom). */
	let waveRoom;
	/** HTML of the 🌊 WaveBeep tab. */
	function groupHtml() {
		const room = myRoom();
		const picked = new Set(waveTicked || opts.picked);
		const list = friends
			.slice()
			.sort((a, b) => a.MemberName.localeCompare(b.MemberName))
			.map(
				(f) =>
					html`<label><input type="checkbox" value="${f.MemberNumber}" ${picked.has(f.MemberNumber) && 'checked'}>${avatar(f.MemberNumber, f.MemberName)}
			<span class="sb-main" style="margin-left:8px"><span class="sb-name">${f.MemberName}</span><span class="sb-sub" style="display:block">${where(f)}</span></span></label>`,
			);
		const roomHint = room ? `They get a button to join you in "${room}".` : "You're not in a chat room, so there's nothing to join.";
		const myRoomButton =
			room &&
			friends.some((f) => f.ChatRoomName === room) &&
			html`<button class="sb-pill" id="sb-myroom" title="Only the friends in your room">📍 My room</button> `;
		return html`<div class="sb-line" style="margin-top:2px"><b>🌊 WaveBeep</b></div><div class="sb-hint" style="margin:0 0 6px">One beep, sent to every friend you tick.</div>
			<textarea id="sb-gmsg" maxlength="1000" placeholder="Write your beep…">${waveText || ''}</textarea>
			<label title="Adds a button to your beep that takes them to the chat room you're in."><input type="checkbox" id="sb-groom" ${!room && 'disabled'} ${room && (waveRoom ?? opts.shareRoom) && 'checked'}>
				<span>📍 Let them join me<span class="sb-hint" style="display:block">${roomHint}</span></span></label>
			<div class="sb-line"><b>Beep who?</b><span>${myRoomButton}<button class="sb-pill" id="sb-all">All</button> <button class="sb-pill" id="sb-none">None</button></span></div>
			${list.length ? list : html`<div class="sb-empty">🌙 None of your friends are online.</div>`}
			<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span id="sb-gcount"></span><button class="sb-go" id="sb-gsend">Send 🌊</button></div>
			<div class="sb-hint" id="sb-gstatus"></div>`;
	}

	/** Wires the WaveBeep tab and sends the beeps, opts.gap seconds apart. */
	function wireGroup() {
		const boxes = () => $$inputs($('sb-body'), 'label input[type=checkbox]:not(#sb-groom)');
		const chosen = () =>
			boxes()
				.filter((b) => b.checked)
				.map((b) => Number(b.value));
		const count = () => {
			const n = chosen().length;
			waveTicked = chosen();
			if (opts.remember) {
				// Offline friends stay in `picked`.
				const online = new Set(friends.map((f) => f.MemberNumber));
				opts.picked = [...new Set([...opts.picked.filter((m) => !online.has(m)), ...waveTicked])];
				saveOpts();
			}
			$('sb-gcount').textContent = `${n} picked of ${friends.length} online`;
			$input('sb-gsend').disabled = sending || n === 0;
		};
		for (const b of boxes()) {
			b.addEventListener('change', count);
		}
		$('sb-all').addEventListener('click', () => {
			for (const b of boxes()) {
				b.checked = true;
			}
			count();
		});
		$('sb-none').addEventListener('click', () => {
			for (const b of boxes()) {
				b.checked = false;
			}
			count();
		});
		// 📍 My room: ticks only the friends in your room.
		if ($('sb-myroom')) {
			$('sb-myroom').addEventListener('click', () => {
				const here = new Set(friends.filter((f) => f.ChatRoomName && f.ChatRoomName === myRoom()).map((f) => f.MemberNumber));
				for (const b of boxes()) {
					b.checked = here.has(Number(b.value));
				}
				count();
			});
		}
		$('sb-gmsg').addEventListener('input', (e) => {
			waveText = inputOf(e).value;
		});
		$('sb-groom').addEventListener('change', (e) => {
			waveRoom = inputOf(e).checked;
		});
		$('sb-gsend').addEventListener('click', async () => {
			const msg = $input('sb-gmsg').value.trim();
			const targets = chosen();
			/** @param {string} t */
			const status = (t) => {
				const s = $('sb-gstatus');
				if (s) {
					s.textContent = t;
				}
			};
			if (!msg) {
				return status('Write a message first.');
			}
			if (!targets.length || sending) {
				return;
			}
			sending = true;
			$input('sb-gsend').disabled = true;
			const includeRoom = $input('sb-groom').checked && !!myRoom();
			let done = 0;
			for (const n of targets) {
				beep(n, msg, includeRoom);
				done += 1;
				status(`🌊 Sending… ${done} / ${targets.length} (${nameOf(n)})`);
				if (done < targets.length) {
					await new Promise((r) => setTimeout(r, opts.gap * 1000));
				}
			}
			sending = false;
			unlock('fb');
			if (targets.length >= 10) {
				unlock('bw');
			}
			waveText = '';
			if ($('sb-gmsg')) {
				$input('sb-gmsg').value = '';
			}
			status(`✨ Done: beeped ${done} friend${done === 1 ? '' : 's'}.`);
			// The status line says it already; the note is for a wave that finished with the tab out of sight.
			if (!isOpen() || !$('sb-gstatus')) {
				notify(`✓ Beep sent to ${done === 1 ? nameOf(targets[0]) : `${done} friends`}`);
			}
			if ($('sb-gsend')) {
				count();
			}
		});
		count();
	}

	/** Opens SlimeBeep's page in the game's Settings > Extensions (⚙); leaving it comes back here. */
	function openSettings() {
		if (typeof PreferenceSubscreenExtensionsOpen !== 'function') {
			notify("⚙ SlimeBeep's settings are in the game's Settings > Extensions");
			return;
		}
		setOpen(false);
		Promise.resolve(PreferenceSubscreenExtensionsOpen('SlimeBeep')).catch((e) => warn(e, 'settings'));
	}
	/** Removes your profile picture (and the photo it was cut from) and tells SlimeBeep friends. */
	function removePicture() {
		setMyPfp(null);
		try {
			localStorage.removeItem(srcKey());
		} catch (err) {
			/* fine */
		}
		pushPicture();
		notify('Profile picture removed');
	}
	/**
	 * Registers SlimeBeep's page in the game's Settings > Extensions, drawn on the game's canvas with its
	 * own checkbox and button helpers: checkboxes on the left, over two pages (they don't all fit the
	 * screen), and buttons on the right.
	 */
	function registerSettings() {
		if (typeof PreferenceRegisterExtensionSetting !== 'function') {
			return;
		}
		if (typeof PreferenceExtensionsSettings === 'object' && PreferenceExtensionsSettings && PreferenceExtensionsSettings.SlimeBeep) {
			return;
		}
		/** @typedef {[number, number, number, number]} Rect x, y, width, height on the canvas */
		/** @type {Rect} */
		const EXIT = [1815, 75, 90, 90];
		// The page switch, beside the exit, like the game's own Back / Next button.
		/** @type {Rect} */
		const PAGE = [1590, 75, 200, 90];
		/** @type {Rect} */
		const BACK = [1590, 75, 100, 90];
		/** @type {Rect} */
		const NEXT = [1690, 75, 100, 90];
		const LEFT = 500,
			TOP = 160,
			ROW = 70;
		/** @typedef {[string, string | (() => string), () => unknown, (on: boolean) => void, (() => boolean)?]} Box id, label, get, set, shown */
		/** @type {Box[][]} Notifications first, then the look, rooms and WaveBeeps (the gap setting goes under them). */
		const pages = [
			[
				['sound', 'Pop sound for new beeps', () => opts.sound, (on) => setOpt('sound', on)],
				['popups', 'Show new beeps in a pop-up (click to reply)', () => opts.popups, (on) => setOpt('popups', on)],
				['groupAll', 'Group chats notify me of every message', () => opts.groupAll, (on) => setOpt('groupAll', on)],
				['quietOpen', 'No sound or pop-up while SlimeBeep is open', () => opts.quietOpen, (on) => setOpt('quietOpen', on)],
				['desktop', 'Desktop notification when in the background', () => opts.desktop, (on) => setDesktop(on)],
				['dnd', 'Do not disturb (no sounds or pop-ups)', () => opts.dnd, (on) => setDnd(on)],
				['updateNotes', "Tell me what's new after an update", () => opts.updateNotes, (on) => setOpt('updateNotes', on)],
			],
			[
				['night', 'Night mode (a night blue slime)', () => opts.night, (on) => setNight(on)],
				// Listed only while a theme add-on is running.
				[
					'themed',
					() => `Match my ${(themeSource() || {}).name || 'theme'} colours`,
					() => opts.themed,
					(on) => setThemed(on),
					() => !!themeSource(),
				],
				['share', '"Let them join me" starts on', () => opts.shareRoom, (on) => setOpt('shareRoom', on)],
				[
					'remember',
					'Remember who I picked for WaveBeeps',
					() => opts.remember,
					(on) => {
						setOpt('remember', on);
						if (!on) {
							setOpt('picked', []);
						}
					},
				],
				['keep', 'Keep my beeps in this browser after I log out', () => opts.keep, (on) => setKeep(on)],
			],
		];
		let page = 0;
		/** @type {[() => string, () => void, (() => boolean)?][]} The buttons on the right, top to bottom: label, action, shown. */
		const buttons = [
			[() => (myPfp() ? 'Change profile picture' : 'Choose profile picture'), () => pickPicture()],
			[
				() => 'Adjust profile picture',
				() => {
					const src = loadSrc();
					if (src) {
						openCropper(src);
					}
				},
				() => !!myPfp() && !!loadSrc(),
			],
			[() => 'Remove profile picture', removePicture, () => !!myPfp()],
			[
				() => 'Reset position and size',
				() => {
					setOpt('pos', null);
					setOpt('win', null);
					place();
				},
			],
			[
				() => `Slime badges: ${{ all: 'everyone', others: 'others only', none: 'off' }[opts.badges] || 'everyone'}`,
				() => setOpt('badges', /** @type {const} */ ({ all: 'others', others: 'none', none: 'all' })[opts.badges] || 'others'),
			],
			[() => `Clear kept beeps (${hist.length})`, clearKept],
			[() => 'Ask again for picture sites', () => setOpt('trustedHosts', []), () => opts.trustedHosts.length > 0],
		];
		const RIGHT = 1430,
			BUTTON_W = 440;
		// This page's boxes and the buttons shown right now (an entry's last, optional item decides).
		const shown = () => pages[page].filter((b) => !b[4] || b[4]());
		const shownButtons = () => buttons.filter((b) => !b[2] || b[2]());
		/**
		 * Recomputed every frame: the shown boxes can change. The WaveBeep gap is on the last page only.
		 * @returns {{ g: number, MINUS: Rect, PLUS: Rect } | null}
		 */
		const layout = () => {
			if (page !== pages.length - 1) {
				return null;
			}
			const g = TOP + shown().length * ROW;
			return { g, MINUS: [LEFT, g, 64, 64], PLUS: [LEFT + 80, g, 64, 64] };
		};
		/**
		 * The rectangle of the i-th shown button.
		 * @param {number} i
		 * @returns {Rect}
		 */
		const buttonAt = (i) => [RIGHT, TOP + i * ROW, BUTTON_W, 64];
		/** @param {Rect} r */
		const mouse = (r) => typeof MouseIn === 'function' && MouseIn(...r);
		PreferenceRegisterExtensionSetting({
			Identifier: 'SlimeBeep',
			ButtonText: 'SlimeBeep',
			Image: ICON,
			// The game turns a page down without load, run and click. Opening it starts on the first page.
			load: () => {
				page = 0;
			},
			run: () => {
				try {
					DrawCharacter(Player, 50, 50, 0.9);
					MainCanvas.textAlign = 'left';
					DrawText(`- SlimeBeep Settings - v${VERSION}`, LEFT, 125, 'Black', 'Gray');
					shown().forEach(([, label, get], i) =>
						DrawCheckbox(LEFT, TOP + i * ROW, 64, 64, typeof label === 'function' ? label() : label, !!get()),
					);
					const gap = layout();
					// The game centres button labels with the current textAlign.
					MainCanvas.textAlign = 'center';
					if (gap) {
						DrawButton(...gap.MINUS, '-', 'White');
						DrawButton(...gap.PLUS, '+', 'White');
						MainCanvas.textAlign = 'left';
						DrawText(`Wait ${opts.gap} seconds between WaveBeeps`, LEFT + 180, gap.g + 33, 'Black', 'Gray');
						MainCanvas.textAlign = 'center';
					}
					DrawBackNextButton(
						...PAGE,
						`Page ${page + 1}/${pages.length}`,
						'White',
						'',
						() => '',
						() => '',
					);
					shownButtons().forEach(([label], i) => DrawButton(...buttonAt(i), label(), 'White'));
					drawMyPic(RIGHT - 84, TOP, 64);
					DrawButton(...EXIT, '', 'White', 'Icons/Exit.png');
				} catch (e) {
					// Never throw inside the game's draw loop.
				} finally {
					if (typeof MainCanvas !== 'undefined' && MainCanvas) {
						MainCanvas.textAlign = 'center';
					}
				}
			},
			click: () => {
				try {
					if (mouse(EXIT)) {
						if (typeof PreferenceSubscreenExtensionsClear === 'function') {
							PreferenceSubscreenExtensionsClear();
						}
						return;
					}
					// Back on the left half, Next on the right, both going round.
					if (mouse(BACK) || mouse(NEXT)) {
						page = (page + (mouse(BACK) ? pages.length - 1 : 1)) % pages.length;
						return;
					}
					const gap = layout();
					shown().forEach(([, , get, set], i) => {
						if (mouse([LEFT, TOP + i * ROW, 64, 64])) {
							set(!get());
						}
					});
					if (gap && mouse(gap.MINUS)) {
						setOpt('gap', Math.max(1, opts.gap - 0.5));
					}
					if (gap && mouse(gap.PLUS)) {
						setOpt('gap', Math.min(10, opts.gap + 0.5));
					}
					const hit = shownButtons().find((b, i) => mouse(buttonAt(i)));
					if (hit) {
						hit[1]();
					}
				} catch (e) {
					warn(e);
				}
			},
			exit: () => true,
		});
	}

	/**
	 * Sets and saves one option.
	 * @template {keyof Options} K
	 * @param {K} name
	 * @param {Options[K]} value
	 */
	function setOpt(name, value) {
		opts[name] = value;
		saveOpts();
	}

	/**
	 * Turns desktop notifications on or off; asks the browser for permission and turns off if refused.
	 * @param {boolean} on
	 */
	async function setDesktop(on) {
		setOpt('desktop', !!on);
		if (on && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
			const answer = await Notification.requestPermission().catch(() => 'denied');
			if (answer !== 'granted') {
				setOpt('desktop', false);
				notify('The browser blocked notifications');
			}
		}
	}

	/**
	 * Turns saving of chat history on or off.
	 * @param {boolean} on
	 */
	function setKeep(on) {
		setOpt('keep', !!on);
		if (opts.keep) {
			saveHistory();
		} else {
			try {
				localStorage.removeItem(histKey());
			} catch (err) {
				/* nothing kept anyway */
			}
		}
	}

	/** Deletes the saved history (this session's beeps stay, the game still has them). */
	function clearKept() {
		try {
			localStorage.removeItem(histKey());
		} catch (err) {
			/* nothing kept anyway */
		}
		hist = hist.filter((h) => live.has(h.k));
		histKeys.clear();
		for (const h of hist) {
			histKeys.add(h.k);
		}
		saveHistory();
		if (isOpen()) {
			render();
		}
	}

	/** Supported theme add-ons: [id, name, probe returning one of its CSS variables]. */
	/** @type {[string, string, () => unknown][]} */
	const THEME_SOURCES = [
		['themed', 'Themed', () => getComputedStyle(document.documentElement).getPropertyValue('--tmd-main')],
		['bcneko', 'BCNeko', () => document.body && getComputedStyle(document.body).getPropertyValue('--bcn-panel')],
	];
	/** The first running theme add-on: { id, name }, or null. */
	function themeSource() {
		for (const [id, name, probe] of THEME_SOURCES) {
			try {
				if (String(probe() || '').trim()) {
					return { id, name };
				}
			} catch (e) {
				/* not this one */
			}
		}
		return null;
	}
	/** Sets the classes that map a theme add-on's colours onto SlimeBeep's (re-run every 5 s from tick). Returns the source. */
	function applyThemed() {
		const src = opts.themed ? themeSource() : null;
		const root = document.documentElement;
		root.classList.toggle('sb-themed', !!src);
		for (const [id] of THEME_SOURCES) {
			root.classList.toggle(`sb-theme-${id}`, !!src && src.id === id);
		}
		return src;
	}
	/**
	 * Turns theme matching on or off.
	 * @param {boolean} on
	 */
	function setThemed(on) {
		setOpt('themed', !!on);
		applyThemed();
	}

	/**
	 * Turns night mode on or off (the sb-night class on <html>).
	 * @param {boolean} on
	 */
	function setNight(on) {
		opts.night = !!on;
		saveOpts();
		document.documentElement.classList.toggle('sb-night', opts.night);
		const moon = $('sb-moon');
		if (moon) {
			moon.textContent = opts.night ? '☀️' : '🌙';
			moon.title = opts.night ? 'Day mode' : 'Night mode';
		}
	}

	/** Member number that 🐞 reports can be beeped to (SlimeQueenSamantha). */
	const OWNER = 255659;
	/** New GitHub issue page, for 🐞 reports. */
	const ISSUES = 'https://github.com/Proudkiller0015/slimebeep/issues/new';
	/**
	 * Report details: versions, browser, other mods, recent errors.
	 * @param {boolean} withNumber adds your member number
	 */
	function details(withNumber) {
		const mods = (() => {
			try {
				const sdk = window.bcModSdk;
				return sdk && typeof sdk.getModsInfo === 'function'
					? sdk
							.getModsInfo()
							.map((m) => `${m.name} ${m.version}`)
							.join(', ')
					: '';
			} catch (e) {
				return '';
			}
		})();
		const d = window.SlimeBeep && typeof window.SlimeBeep.debug === 'function' ? window.SlimeBeep.debug() : {};
		return [
			`SlimeBeep ${VERSION}`,
			`Game: ${typeof GameVersion === 'string' ? GameVersion : '?'}${typeof CurrentScreen === 'string' ? ` (screen: ${CurrentScreen})` : ''}`,
			`Browser: ${navigator.userAgent}`,
			withNumber && loggedIn() ? `Reported by: #${Player.MemberNumber}` : null,
			`Listening: ${d.listening ? 'yes' : 'no'}${d.catchAll ? ', catch-all' : ''}; groups: ${Object.keys(groups).length}; kept beeps: ${hist.length}`,
			mods ? `Other mods: ${mods}` : null,
			missing().length
				? `Missing from the game: ${missing()
						.map(([k]) => k)
						.join(', ')}`
				: null,
			errors.length ? `Recent errors:\n${errors.map((x) => `- ${x}`).join('\n')}` : 'Recent errors: none',
		]
			.filter(Boolean)
			.join('\n');
	}
	/** The full 🐞 report: what the player wrote, then details(). */
	function reportText() {
		const what = clean($input('sb-bug-what').value, 1500);
		const how = clean($input('sb-bug-how').value, 800);
		return {
			what,
			how,
			full: `What happened:\n${what || '(not filled in)'}\n\nWhat I was doing:\n${how || '(not filled in)'}\n\n---\n${details($input('sb-bug-num').checked)}`,
		};
	}

	/** @type {{ what?: string, how?: string, num?: boolean }} The bug report being written. */
	let bugDraft = {};
	/** HTML of the 🐞 tab. */
	function bugHtml() {
		const draft = bugDraft || {};
		return html`<div class="sb-line" style="margin-top:2px"><b>🐞 Report a bug</b></div>
			<div class="sb-hint" style="margin:0 0 6px">Tell SlimeQueenSamantha what went wrong. SlimeBeep adds its version and recent errors for you.</div>
			<textarea id="sb-bug-what" maxlength="1500" placeholder="What happened?">${draft.what || ''}</textarea>
			<textarea id="sb-bug-how" maxlength="800" placeholder="What were you doing? (optional)" style="height:52px;margin-top:6px">${draft.how || ''}</textarea>
			<label><input type="checkbox" id="sb-bug-num" ${draft.num !== false && 'checked'}><span>Include my member number so she can beep me back</span></label>
			<details style="margin:6px 2px"><summary class="sb-hint" style="cursor:pointer">What gets added</summary><pre id="sb-bug-details" style="white-space:pre-wrap;font-size:11px;margin:4px 0 0">${details(draft.num !== false)}</pre></details>
			<div class="sb-line" style="flex-wrap:wrap;justify-content:flex-start;gap:6px">
				<button class="sb-go" id="sb-bug-github" title="Opens a new bug report on GitHub, filled in (needs a GitHub account)">🐙 Open on GitHub</button>
				<button class="sb-pill" id="sb-bug-copy">📋 Copy</button>
				<button class="sb-pill" id="sb-bug-beep" title="Only arrives if SlimeQueenSamantha has you on her friend list">📨 Beep it to her</button>
			</div>
			<div class="sb-hint" id="sb-bug-status"></div>`;
	}

	/** Wires the 🐞 tab: open a GitHub issue, copy, or beep the report. */
	function wireBug() {
		const keep = () => {
			bugDraft = { what: $input('sb-bug-what').value, how: $input('sb-bug-how').value, num: $input('sb-bug-num').checked };
		};
		/** @param {string} t */
		const status = (t) => {
			const x = $('sb-bug-status');
			if (x) {
				x.textContent = t;
			}
		};
		for (const id of ['sb-bug-what', 'sb-bug-how']) {
			$(id).addEventListener('input', keep);
		}
		$('sb-bug-num').addEventListener('change', () => {
			keep();
			$('sb-bug-details').textContent = details($input('sb-bug-num').checked);
		});
		const ready = () => {
			const r = reportText();
			if (!r.what) {
				status('Write what happened first.');
				$('sb-bug-what').focus();
				return null;
			}
			return r;
		};
		$('sb-bug-github').addEventListener('click', () => {
			const r = ready();
			if (!r) {
				return;
			}
			const title = `Bug: ${r.what.split('\n')[0].slice(0, 70)}`;
			window.open(`${ISSUES}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(r.full)}`, '_blank', 'noopener');
			status('Opened on GitHub: check it and press "Create" there.');
		});
		$('sb-bug-copy').addEventListener('click', async () => {
			const r = ready();
			if (!r) {
				return;
			}
			try {
				await navigator.clipboard.writeText(r.full);
				status('📋 Copied. Paste it wherever you talk to SlimeQueenSamantha.');
			} catch (e) {
				status('The browser would not copy it. Open "What gets added" and copy by hand.');
			}
		});
		$('sb-bug-beep').addEventListener('click', () => {
			const r = ready();
			if (!r) {
				return;
			}
			if (!loggedIn()) {
				return status('Log in first.');
			}
			// A beep holds 1000 characters: the description first, then as many details as fit.
			const text =
				`🐞 SlimeBeep bug report\n${r.what}${r.how ? `\nDoing: ${r.how}` : ''}\n— ${details($input('sb-bug-num').checked)}`.slice(0, 990);
			beep(OWNER, text, false);
			notify('🐞 Report beeped');
			status('Beeped to SlimeQueenSamantha. It only arrives if she has you on her friend list; if unsure, use GitHub or Copy too.');
		});
	}

	/* "Invite <them> to…": every group you can invite to, an Invite button each (opened by other add-ons too). */
	/** @type {{ n: number, results: Record<string, HtmlValue> } | null} State of the "Invite <member> to…" page (api.openInvite). */
	let inviteFor = null;
	/** HTML of the "Invite <member> to…" page. */
	function inviteForHtml() {
		if (!inviteFor) {
			return html``;
		}
		const n = inviteFor.n;
		const name = nameOf(n);
		let how = `They get a code to paste in 👥 Groups, made for #${n} only.`;
		if (isFriend(n)) {
			how = peers.has(n) ? `${name} has SlimeBeep: they get an invite card.` : `${name} gets a beep with the code.`;
		}
		const results = inviteFor.results;
		const list = Object.values(groups).filter((g) => canInvite(g, Player.MemberNumber));
		const rows = list.map((g) => {
			const res = results[g.id];
			// Admins can still let a listed member back in, for when they lost their keys.
			let action = html`<button class="sb-go" data-invite="${g.id}" ${res && 'disabled'}>Invite</button>`;
			if (isMember(g, n)) {
				action = isAdmin(g, Player.MemberNumber)
					? html`<button class="sb-go" data-invite="${g.id}" ${res && 'disabled'} title="Already in it: this lets them back in if they lost their SlimeBeep data">Let back in</button>`
					: html`<span class="sb-hint">Already in it</span>`;
			}
			return html`<div class="sb-row" style="cursor:default;display:block"><div style="display:flex;align-items:center;gap:8px">${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name}</div><div class="sb-sub">${g.members.length} / ${LIMITS.members} members</div></div>
				${action}</div>
				${res && html`<div class="sb-hint" style="margin-top:4px">${res}</div>`}</div>`;
		});
		return html`<div class="sb-line"><button class="sb-pill" id="sb-if-back">‹ Back</button><b>👥 Invite ${name}</b></div>
			<div class="sb-hint" style="margin:2px 0 6px">${how}</div>
			${rows.length ? rows : html`<div class="sb-empty">👥 No group chats you can invite to yet.</div>`}`;
	}
	/** Wires the "Invite <member> to…" page. */
	function wireInviteFor() {
		$('sb-if-back').addEventListener('click', () => {
			inviteFor = null;
			tab = 'groups';
			render();
		});
		for (const b of $$inputs($('sb-body'), '[data-invite]')) {
			b.addEventListener('click', async () => {
				const id = b.dataset.invite || '';
				const page = inviteFor;
				if (!page) {
					return;
				}
				b.disabled = true;
				const r = await inviteToGroup(id, page.n);
				if (!r.ok) {
					page.results[id] = `⚠ ${r.why}`;
				} else if (r.sent === 'later') {
					page.results[id] = `⏳ ${nameOf(page.n)} has no SlimeBeep: invite beeps like that go ${PLAIN_MAX} a minute, try again in one.`;
				} else if (r.sent) {
					page.results[id] = '📨 Invite sent!';
				} else {
					page.results[id] = html`Code: <code style="user-select:all">${r.code}</code> — give it to them (copied).`;
				}
				if (r.ok && !r.sent) {
					try {
						await navigator.clipboard.writeText(r.code || '');
					} catch (e) {
						/* shown to copy by hand */
					}
				}
				if (tab === 'invitefor') {
					render(true);
				}
			});
		}
	}

	/**
	 * Start-up. A copy loaded from PAGES (FUSAM, the bookmarklet) starts at once. Otherwise (the
	 * userscript loader reads raw.githubusercontent.com, which can serve an old copy for a few minutes)
	 * it asks PAGES for the current version first and runs that one instead if it is newer; with no answer
	 * within 4 s it starts as is.
	 */
	const PAGES = 'https://proudkiller0015.github.io/slimebeep/slimebeep.js';
	/**
	 * Whether version string `a` is newer than `b`.
	 * @param {string} a
	 * @param {string} b
	 */
	const newer = (a, b) => {
		const x = a.split('.').map(Number),
			y = b.split('.').map(Number);
		for (let i = 0; i < 3; i++) {
			if ((x[i] || 0) !== (y[i] || 0)) {
				return (x[i] || 0) > (y[i] || 0);
			}
		}
		return false;
	};
	/** Builds SlimeBeep. */
	function start() {
		try {
			build();
		} catch (e) {
			warn(e, 'could not start');
		}
	}
	if (window.SlimeBeepHopped || LOADED_FROM.startsWith('https://proudkiller0015.github.io/slimebeep/')) {
		start();
	} else {
		const ctl = typeof AbortController === 'function' ? new AbortController() : null;
		const timer = setTimeout(() => {
			if (ctl) {
				ctl.abort();
			}
		}, 4000);
		fetch(`${PAGES}?t=${Date.now()}`, { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
			.then((r) => (r.ok ? r.text() : ''))
			.then((code) => {
				clearTimeout(timer);
				const m = /const VERSION = '(\d+\.\d+\.\d+)'/.exec(code);
				if (!m || !newer(m[1], VERSION)) {
					return start();
				}
				// Run the newer copy instead of this one.
				window.SlimeBeepHopped = true;
				delete window.SlimeBeep;
				const script = document.createElement('script');
				script.textContent = `${code}\n//# sourceURL=slimebeep.js`;
				document.head.appendChild(script);
				script.remove();
			})
			.catch(() => {
				clearTimeout(timer);
				start();
			});
	}
})();
